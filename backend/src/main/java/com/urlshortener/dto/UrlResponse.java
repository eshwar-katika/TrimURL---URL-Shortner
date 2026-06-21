package com.urlshortener.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlResponse {
    private Long id;
    private String shortCode;
    private String longUrl;
    private String shortUrl;
    private ZonedDateTime createdAt;
    private ZonedDateTime expiresAt;
    private String status;
    private Long clickCount;
}
