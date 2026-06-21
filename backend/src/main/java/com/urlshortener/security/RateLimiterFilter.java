package com.urlshortener.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class RateLimiterFilter extends OncePerRequestFilter {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    private static final String LUA_SCRIPT =
            "local key = KEYS[1] " +
            "local capacity = tonumber(ARGV[1]) " +
            "local refill_rate = tonumber(ARGV[2]) " +
            "local now = tonumber(ARGV[3]) " +
            "local requested = 1 " +
            
            "local current_tokens = tonumber(redis.call('hget', key, 'tokens')) " +
            "local last_refill = tonumber(redis.call('hget', key, 'last_refill')) " +
            
            "if not current_tokens then " +
            "    current_tokens = capacity " +
            "    last_refill = now " +
            "else " +
            "    local elapsed = math.max(0, now - last_refill) " +
            "    current_tokens = math.min(capacity, current_tokens + elapsed * refill_rate) " +
            "end " +
            
            "if current_tokens >= requested then " +
            "    current_tokens = current_tokens - requested " +
            "    redis.call('hset', key, 'tokens', current_tokens) " +
            "    redis.call('hset', key, 'last_refill', now) " +
            "    redis.call('expire', key, 60) " +
            "    return 1 " +
            "else " +
            "    return 0 " +
            "end";

    private final DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        
        String key = "ratelimit:" + ipAddress;
        
        // 100 requests capacity, refilling 1.66 tokens per second (100 tokens / 60 seconds)
        long capacity = 100;
        double refillRate = 1.666;
        long now = Instant.now().getEpochSecond();
        
        Long result = 0L;
        try {
            result = redisTemplate.execute(
                    redisScript,
                    Collections.singletonList(key),
                    String.valueOf(capacity),
                    String.valueOf(refillRate),
                    String.valueOf(now)
            );
        } catch (Exception e) {
            // Fail open if Redis is down, to ensure availability
            result = 1L;
        }

        if (result != null && result == 1L) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests - Rate limit exceeded");
        }
    }
}
