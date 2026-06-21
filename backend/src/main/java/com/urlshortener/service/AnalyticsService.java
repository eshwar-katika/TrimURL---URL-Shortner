package com.urlshortener.service;

import com.urlshortener.dto.AnalyticsResponseDto;

public interface AnalyticsService {
    AnalyticsResponseDto getUrlStats(String shortCode);
}
