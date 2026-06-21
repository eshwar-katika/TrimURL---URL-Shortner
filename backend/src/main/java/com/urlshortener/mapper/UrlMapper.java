package com.urlshortener.mapper;

import com.urlshortener.dto.UrlResponse;
import com.urlshortener.model.Url;
import org.springframework.stereotype.Component;

@Component
public class UrlMapper {

    public UrlResponse toResponse(Url url, String baseUrl) {
        if (url == null) {
            return null;
        }
        
        String shortUrl = baseUrl + "/" + url.getShortCode();
        
        return UrlResponse.builder()
                .id(url.getId())
                .shortCode(url.getShortCode())
                .longUrl(url.getLongUrl())
                .shortUrl(shortUrl)
                .createdAt(url.getCreatedAt())
                .expiresAt(url.getExpiresAt())
                .status(url.getStatus())
                .clickCount(url.getClickCount())
                .build();
    }
}
