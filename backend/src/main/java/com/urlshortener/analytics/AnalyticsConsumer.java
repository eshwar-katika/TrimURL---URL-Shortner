package com.urlshortener.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.urlshortener.dto.ClickEventDto;
import com.urlshortener.model.AnalyticsEvent;
import com.urlshortener.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(value = "app.analytics.enabled", havingValue = "true", matchIfMissing = true)
public class AnalyticsConsumer {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "url-clicks", groupId = "url-shortener-group")
    public void consumeClickEvent(String message) {
        try {
            ClickEventDto dto = objectMapper.readValue(message, ClickEventDto.class);
            
            AnalyticsEvent entity = AnalyticsEvent.builder()
                    .shortCode(dto.getShortCode())
                    .timestamp(ZonedDateTime.parse(dto.getTimestamp()))
                    .browser(dto.getBrowser())
                    .device(dto.getDevice())
                    .country(dto.getCountry())
                    .build();
            
            analyticsEventRepository.save(entity);
            log.debug("Persisted click analytics event for short code: {}", dto.getShortCode());
        } catch (Exception e) {
            log.error("Failed to process and persist click analytics event", e);
        }
    }
}
