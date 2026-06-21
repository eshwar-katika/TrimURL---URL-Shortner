package com.urlshortener.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CacheServiceImpl implements CacheService {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.cache.use-in-memory:false}")
    private boolean useInMemoryCache;
    
    private static final String CACHE_PREFIX = "shorturl:";
    private static final long DEFAULT_TTL_HOURS = 24;

    private final Map<String, CacheEntry> localCache = new ConcurrentHashMap<>();

    @Override
    public void put(String key, String value) {
        if (useInMemoryCache) {
            localCache.put(CACHE_PREFIX + key, new CacheEntry(value, Instant.now().plusSeconds(TimeUnit.HOURS.toSeconds(DEFAULT_TTL_HOURS))));
            return;
        }

        redisTemplate.opsForValue().set(
                CACHE_PREFIX + key, 
                value, 
                DEFAULT_TTL_HOURS, 
                TimeUnit.HOURS
        );
    }

    @Override
    public String get(String key) {
        if (useInMemoryCache) {
            CacheEntry entry = localCache.get(CACHE_PREFIX + key);
            if (entry == null) {
                return null;
            }
            if (entry.expiresAt.isBefore(Instant.now())) {
                localCache.remove(CACHE_PREFIX + key);
                return null;
            }
            return entry.value;
        }

        return redisTemplate.opsForValue().get(CACHE_PREFIX + key);
    }

    @Override
    public void evict(String key) {
        if (useInMemoryCache) {
            localCache.remove(CACHE_PREFIX + key);
            return;
        }

        redisTemplate.delete(CACHE_PREFIX + key);
    }

    private record CacheEntry(String value, Instant expiresAt) {}
}
