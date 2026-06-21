package com.urlshortener.controller;

import com.urlshortener.dto.AnalyticsResponseDto;
import com.urlshortener.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/urls")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{code}/stats")
    public ResponseEntity<AnalyticsResponseDto> getUrlStats(@PathVariable("code") String code) {
        return ResponseEntity.ok(analyticsService.getUrlStats(code));
    }
}
