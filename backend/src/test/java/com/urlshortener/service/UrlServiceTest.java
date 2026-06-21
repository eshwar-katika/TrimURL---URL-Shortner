package com.urlshortener.service;

import com.urlshortener.analytics.AnalyticsProducer;
import com.urlshortener.cache.CacheService;
import com.urlshortener.dto.UrlRequest;
import com.urlshortener.generator.ShortCodeGenerator;
import com.urlshortener.mapper.UrlMapper;
import com.urlshortener.model.Url;
import com.urlshortener.repository.UrlRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UrlServiceImpl.
 * Uses Mockito without a Spring context to keep tests fast and isolated.
 */
@ExtendWith(MockitoExtension.class)
public class UrlServiceTest {

    @Mock private UrlRepository urlRepository;
    @Mock private UserService userService;
    @Mock private ShortCodeGenerator shortCodeGenerator;
    @Mock private UrlMapper urlMapper;
    @Mock private CacheService cacheService;
    @Mock private AnalyticsProducer analyticsProducer;

    @InjectMocks
    private UrlServiceImpl urlService;

    @BeforeEach
    void setup() {
        // Inject the baseUrl field via reflection since @Value won't work in unit tests
        try {
            java.lang.reflect.Field field = UrlServiceImpl.class.getDeclaredField("baseUrl");
            field.setAccessible(true);
            field.set(urlService, "http://localhost:8080");
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject baseUrl", e);
        }
    }

    // ─── URL Validation Tests ──────────────────────────────────────────────────

    @Test
    public void testCreateUrl_rejectsJavascriptProtocol() {
        UrlRequest request = UrlRequest.builder().longUrl("javascript:alert(1)").build();
        assertThrows(IllegalArgumentException.class, () -> urlService.createUrl(request));
        verifyNoInteractions(urlRepository);
    }

    @Test
    public void testCreateUrl_rejectsFtpProtocol() {
        UrlRequest request = UrlRequest.builder().longUrl("ftp://files.example.com").build();
        assertThrows(IllegalArgumentException.class, () -> urlService.createUrl(request));
        verifyNoInteractions(urlRepository);
    }

    @Test
    public void testCreateUrl_rejectsFileProtocol() {
        UrlRequest request = UrlRequest.builder().longUrl("file:///etc/passwd").build();
        assertThrows(IllegalArgumentException.class, () -> urlService.createUrl(request));
        verifyNoInteractions(urlRepository);
    }

    @Test
    public void testCreateUrl_rejectsNullUrl() {
        UrlRequest request = UrlRequest.builder().longUrl(null).build();
        assertThrows(IllegalArgumentException.class, () -> urlService.createUrl(request));
    }

    @Test
    public void testCreateUrl_rejectsMissingHttpScheme() {
        UrlRequest request = UrlRequest.builder().longUrl("www.example.com").build();
        assertThrows(IllegalArgumentException.class, () -> urlService.createUrl(request));
    }

        @Test
        public void testCreateUrl_allowsAnonymousShorteningWithoutCustomAlias() {
        UrlRequest request = UrlRequest.builder()
            .longUrl("https://example.com/article")
            .build();

        Url savedUrl = Url.builder()
            .id(1L)
            .shortCode("abc123")
            .longUrl("https://example.com/article")
            .status("ACTIVE")
            .clickCount(0L)
            .build();

        when(userService.getCurrentUser()).thenReturn(null);
        when(urlRepository.getNextId()).thenReturn(1L);
        when(shortCodeGenerator.generate(1L)).thenReturn("abc123");
        when(urlRepository.save(any(Url.class))).thenReturn(savedUrl);
        when(urlMapper.toResponse(any(Url.class), anyString())).thenReturn(
            com.urlshortener.dto.UrlResponse.builder()
                .id(1L)
                .shortCode("abc123")
                .longUrl("https://example.com/article")
                .shortUrl("http://localhost:8080/abc123")
                .status("ACTIVE")
                .clickCount(0L)
                .build()
        );

        var response = urlService.createUrl(request);

        assertEquals("abc123", response.getShortCode());
        assertEquals("http://localhost:8080/abc123", response.getShortUrl());
        verify(cacheService).put("abc123", "https://example.com/article");
        verify(urlRepository).save(any(Url.class));
        }

    // ─── Redirect Tests ────────────────────────────────────────────────────────

    @Test
    public void testRedirect_cacheHitReturnsFromRedis() {
        String shortCode = "abc123";
        String longUrl = "https://google.com";

        when(cacheService.get(shortCode)).thenReturn(longUrl);

        String result = urlService.redirect(shortCode, "Mozilla/5.0", "127.0.0.1");

        assertEquals(longUrl, result);
        // Should never hit the database
        verify(urlRepository, never()).findByShortCode(any());
        // Should still fire analytics event
        verify(analyticsProducer, times(1)).sendClickEvent(eq(shortCode), anyString(), anyString());
    }

    @Test
    public void testRedirect_cacheMissFallsThroughToDatabase() {
        String shortCode = "abc123";
        String longUrl = "https://google.com";
        Url url = Url.builder()
                .shortCode(shortCode)
                .longUrl(longUrl)
                .status("ACTIVE")
                .clickCount(0L)
                .build();

        when(cacheService.get(shortCode)).thenReturn(null);
        when(urlRepository.findByShortCode(shortCode)).thenReturn(Optional.of(url));
        when(urlRepository.save(any())).thenReturn(url);

        String result = urlService.redirect(shortCode, "Mozilla/5.0", "127.0.0.1");

        assertEquals(longUrl, result);
        // Must populate Redis after DB fetch
        verify(cacheService, times(1)).put(shortCode, longUrl);
        // Must fire analytics event
        verify(analyticsProducer, times(1)).sendClickEvent(eq(shortCode), anyString(), anyString());
    }

    @Test
    public void testRedirect_unknownCodeThrowsException() {
        String shortCode = "notfound";

        when(cacheService.get(shortCode)).thenReturn(null);
        when(urlRepository.findByShortCode(shortCode)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                urlService.redirect(shortCode, "Mozilla/5.0", "127.0.0.1"));
    }

    @Test
    public void testRedirect_inactiveUrlThrowsException() {
        String shortCode = "inactiveCode";
        Url url = Url.builder()
                .shortCode(shortCode)
                .longUrl("https://example.com")
                .status("INACTIVE")
                .clickCount(0L)
                .build();

        when(cacheService.get(shortCode)).thenReturn(null);
        when(urlRepository.findByShortCode(shortCode)).thenReturn(Optional.of(url));

        assertThrows(IllegalArgumentException.class, () ->
                urlService.redirect(shortCode, "Mozilla/5.0", "127.0.0.1"));
    }
}
