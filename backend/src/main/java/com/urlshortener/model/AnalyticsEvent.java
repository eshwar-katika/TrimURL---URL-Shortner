package com.urlshortener.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "analytics_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "short_code", nullable = false, length = 10)
    private String shortCode;

    @Column(nullable = false)
    @Builder.Default
    private ZonedDateTime timestamp = ZonedDateTime.now();

    private String country;
    private String browser;
    private String device;
}
