package com.urlshortener.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.urlshortener.dto.ClickEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String TOPIC = "url-clicks";
    private static final String[] COUNTRIES = {"India", "United States", "Germany", "United Kingdom", "Canada", "Singapore"};
    private final Random random = new Random();

    @Value("${app.analytics.enabled:true}")
    private boolean enabled;

    public void sendClickEvent(String shortCode, String userAgent, String clientIp) {
        if (!enabled) {
            return;
        }

        try {
            String browser = parseBrowser(userAgent);
            String device = parseDevice(userAgent);
            String country = resolveCountry(clientIp);
            
            ClickEventDto event = ClickEventDto.builder()
                    .shortCode(shortCode)
                    .timestamp(Instant.now().toString())
                    .browser(browser)
                    .device(device)
                    .country(country)
                    .build();

            String jsonEvent = objectMapper.writeValueAsString(event);
            
            kafkaTemplate.send(TOPIC, shortCode, jsonEvent)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to send analytics event to Kafka", ex);
                        } else {
                            log.debug("Sent click event for code {} to Kafka", shortCode);
                        }
                    });
        } catch (Exception e) {
            log.error("Failed to serialize click event", e);
        }
    }

    private String parseBrowser(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("chrome")) return "Chrome";
        if (ua.contains("firefox")) return "Firefox";
        if (ua.contains("safari") && !ua.contains("chrome")) return "Safari";
        if (ua.contains("edge")) return "Edge";
        return "Other";
    }

    private String parseDevice(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Desktop";
        }
        String ua = userAgent.toLowerCase();
        if (ua.contains("mobile") || ua.contains("android") || ua.contains("iphone")) {
            return "Mobile";
        }
        if (ua.contains("tablet") || ua.contains("ipad")) {
            return "Tablet";
        }
        return "Desktop";
    }

    private String resolveCountry(String clientIp) {
        // Mock geo-ip lookup: if local/unknown, distribute randomly to make dashboard charts look rich
        if (clientIp == null || clientIp.equals("127.0.0.1") || clientIp.equals("0:0:0:0:0:0:0:1")) {
            return COUNTRIES[random.nextInt(COUNTRIES.length)];
        }
        // In a real app, use MaxMind GeoIP library. We'll default to a random country for localhost/test simulation
        return COUNTRIES[Math.abs(clientIp.hashCode()) % COUNTRIES.length];
    }
}
