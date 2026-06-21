package com.urlshortener.service;

import com.urlshortener.dto.UrlRequest;
import com.urlshortener.dto.UrlResponse;
import java.util.List;

public interface UrlService {
    UrlResponse createUrl(UrlRequest request);
    String redirect(String shortCode, String userAgent, String clientIp);
    void deleteUrl(String shortCode);
    List<UrlResponse> getUserUrls();
}
