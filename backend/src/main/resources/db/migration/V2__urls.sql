CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    long_url TEXT NOT NULL,
    user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    click_count BIGINT DEFAULT 0 NOT NULL,
    CONSTRAINT fk_urls_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Start the sequence at a high number to generate 6-character short codes initially
ALTER SEQUENCE urls_id_seq RESTART WITH 56800235584; -- 62^6 = 56,800,235,584 (guarantees exactly 6 characters initially)

CREATE INDEX idx_urls_short_code ON urls(short_code);
CREATE INDEX idx_urls_user_id ON urls(user_id);
