package com.urlshortener.repository;

import com.urlshortener.model.AnalyticsEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    List<AnalyticsEvent> findByShortCode(String shortCode);

    @Query("SELECT e.country as name, COUNT(e) as value FROM AnalyticsEvent e WHERE e.shortCode = :shortCode GROUP BY e.country")
    List<Map<String, Object>> getClicksByCountry(@Param("shortCode") String shortCode);

    @Query("SELECT e.browser as name, COUNT(e) as value FROM AnalyticsEvent e WHERE e.shortCode = :shortCode GROUP BY e.browser")
    List<Map<String, Object>> getClicksByBrowser(@Param("shortCode") String shortCode);

    @Query("SELECT e.device as name, COUNT(e) as value FROM AnalyticsEvent e WHERE e.shortCode = :shortCode GROUP BY e.device")
    List<Map<String, Object>> getClicksByDevice(@Param("shortCode") String shortCode);

    @Query("SELECT CAST(e.timestamp as date) as date, COUNT(e) as count FROM AnalyticsEvent e WHERE e.shortCode = :shortCode GROUP BY CAST(e.timestamp as date) ORDER BY CAST(e.timestamp as date) ASC")
    List<Map<String, Object>> getClickHistory(@Param("shortCode") String shortCode);
}
