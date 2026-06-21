package com.urlshortener.service;

import com.urlshortener.cache.CacheService;
import com.urlshortener.dto.UrlRequest;
import com.urlshortener.dto.UrlResponse;
import com.urlshortener.generator.ShortCodeGenerator;
import com.urlshortener.mapper.UrlMapper;
import com.urlshortener.model.Url;
import com.urlshortener.model.User;
import com.urlshortener.repository.UrlRepository;
import com.urlshortener.analytics.AnalyticsProducer;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UrlServiceImpl implements UrlService {

    private final UrlRepository urlRepository;
    private final UserService userService;
    private final ShortCodeGenerator shortCodeGenerator;
    private final UrlMapper urlMapper;
    private final CacheService cacheService;
    private final AnalyticsProducer analyticsProducer;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${app.cache.use-in-memory:false}")
    private boolean useInMemoryCache;

    private final AtomicLong localShortCodeSequence = new AtomicLong(56_800_235_583L);

    @Override
    @Transactional
    public UrlResponse createUrl(UrlRequest request) {
        validateUrl(request.getLongUrl());
        User currentUser = userService.getCurrentUser();

        String shortCode;
        if (request.getCustomAlias() != null && !request.getCustomAlias().trim().isEmpty()) {
            if (currentUser == null) {
                throw new AccessDeniedException("Login required for custom aliases");
            }
            String alias = request.getCustomAlias().trim();
            if (alias.length() < 4) {
                throw new IllegalArgumentException("Custom alias must be at least 4 characters long");
            }
            if (urlRepository.findByShortCode(alias).isPresent()) {
                throw new IllegalArgumentException("Custom alias already in use");
            }
            shortCode = alias;
        } else {
            if (useInMemoryCache) {
                shortCode = shortCodeGenerator.generate(localShortCodeSequence.incrementAndGet());
            } else {
                // Allocate database ID first using sequence to generate deterministic short code
                Long nextId = urlRepository.getNextId();
                shortCode = shortCodeGenerator.generate(nextId);
            }
        }

        Url url = Url.builder()
                .shortCode(shortCode)
                .longUrl(request.getLongUrl())
                .user(currentUser)
                .expiresAt(request.getExpiresAt())
                .build();

        Url savedUrl = urlRepository.save(url);
        
        // Populate cache
        cacheService.put(savedUrl.getShortCode(), savedUrl.getLongUrl());

        return urlMapper.toResponse(savedUrl, baseUrl);
    }

    @Override
    @Transactional
    public String redirect(String shortCode, String userAgent, String clientIp) {
        // Read-through cache logic: Check Redis first
        String cachedLongUrl = cacheService.get(shortCode);
        if (cachedLongUrl != null) {
            // Publish click tracking event asynchronously
            analyticsProducer.sendClickEvent(shortCode, userAgent, clientIp);
            return cachedLongUrl;
        }

        // Cache miss: Check PostgreSQL
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new IllegalArgumentException("Short code not found"));

        if (!"ACTIVE".equals(url.getStatus())) {
            throw new IllegalArgumentException("This URL is inactive");
        }

        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(ZonedDateTime.now())) {
            url.setStatus("EXPIRED");
            urlRepository.save(url);
            cacheService.evict(shortCode);
            throw new IllegalArgumentException("This URL has expired");
        }

        // Increment click count (simple count update)
        url.setClickCount(url.getClickCount() + 1);
        urlRepository.save(url);

        // Populate Redis cache
        cacheService.put(shortCode, url.getLongUrl());

        // Publish click tracking event asynchronously
        analyticsProducer.sendClickEvent(shortCode, userAgent, clientIp);

        return url.getLongUrl();
    }

    @Override
    @Transactional
    public void deleteUrl(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new IllegalArgumentException("Short code not found"));

        User currentUser = userService.getCurrentUser();
        if (url.getUser() == null || currentUser == null || !url.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this URL");
        }

        urlRepository.delete(url);
        cacheService.evict(shortCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UrlResponse> getUserUrls() {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("User must be authenticated");
        }

        return urlRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(url -> urlMapper.toResponse(url, baseUrl))
                .collect(Collectors.toList());
    }

    private void validateUrl(String url) {
        if (url == null) {
            throw new IllegalArgumentException("URL cannot be null");
        }
        String lowercase = url.toLowerCase().trim();
        if (!lowercase.startsWith("http://") && !lowercase.startsWith("https://")) {
            throw new IllegalArgumentException("URL must start with http:// or https://");
        }
        if (lowercase.contains("javascript:") || lowercase.contains("file:") || lowercase.contains("ftp:")) {
            throw new IllegalArgumentException("Forbidden protocol in URL");
        }
    }
}
