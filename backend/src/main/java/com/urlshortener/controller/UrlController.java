package com.urlshortener.controller;

import com.urlshortener.dto.UrlRequest;
import com.urlshortener.dto.UrlResponse;
import com.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UrlController {

    private final UrlService urlService;

    @PostMapping("/api/v1/urls")
    public ResponseEntity<UrlResponse> createUrl(@RequestBody UrlRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(urlService.createUrl(request));
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(
            @PathVariable("shortCode") String shortCode,
            @RequestHeader(value = HttpHeaders.USER_AGENT, required = false) String userAgent,
            HttpServletRequest request) {
        
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        
        String longUrl = urlService.redirect(shortCode, userAgent, ipAddress);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(longUrl))
                .build();
    }

    @DeleteMapping("/api/v1/urls/{code}")
    public ResponseEntity<Void> deleteUrl(@PathVariable("code") String code) {
        urlService.deleteUrl(code);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/urls")
    public ResponseEntity<List<UrlResponse>> getUserUrls() {
        return ResponseEntity.ok(urlService.getUserUrls());
    }
}
