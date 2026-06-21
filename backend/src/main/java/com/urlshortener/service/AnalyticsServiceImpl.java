package com.urlshortener.service;

import com.urlshortener.dto.AnalyticsResponseDto;
import com.urlshortener.model.Url;
import com.urlshortener.model.User;
import com.urlshortener.repository.AnalyticsEventRepository;
import com.urlshortener.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final UrlRepository urlRepository;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponseDto getUrlStats(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new IllegalArgumentException("Short code not found"));

        User currentUser = userService.getCurrentUser();
        // Secure analytics page: only the owner of the URL can see its traffic statistics
        if (url.getUser() != null) {
            if (currentUser == null || !url.getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You do not have permission to view stats for this URL");
            }
        }

        return AnalyticsResponseDto.builder()
                .totalClicks(url.getClickCount())
                .byCountry(analyticsEventRepository.getClicksByCountry(shortCode))
                .byBrowser(analyticsEventRepository.getClicksByBrowser(shortCode))
                .byDevice(analyticsEventRepository.getClicksByDevice(shortCode))
                .clickHistory(analyticsEventRepository.getClickHistory(shortCode))
                .build();
    }
}
