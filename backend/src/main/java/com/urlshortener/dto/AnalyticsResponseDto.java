package com.urlshortener.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponseDto {
    private Long totalClicks;
    private List<Map<String, Object>> byCountry;
    private List<Map<String, Object>> byBrowser;
    private List<Map<String, Object>> byDevice;
    private List<Map<String, Object>> clickHistory;
}
