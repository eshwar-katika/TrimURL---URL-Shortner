CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    country VARCHAR(50),
    browser VARCHAR(50),
    device VARCHAR(50)
);

CREATE INDEX idx_analytics_events_short_code ON analytics_events(short_code);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
