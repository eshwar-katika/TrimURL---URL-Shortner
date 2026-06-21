package com.urlshortener.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickEventDto {
    private String shortCode;
    private String timestamp;
    private String country;
    private String browser;
    private String device;
}
