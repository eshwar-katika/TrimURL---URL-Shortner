package com.urlshortener.generator;

import org.springframework.stereotype.Component;

@Component
public class ShortCodeGenerator {
    
    /**
     * Generates a deterministic Base62 short code from a unique database sequence ID.
     * Thread-safe and collision-free since IDs are unique.
     */
    public String generate(long id) {
        return Base62Encoder.encode(id);
    }

    /**
     * Decodes the short code back to the unique database sequence ID.
     */
    public long decode(String code) {
        return Base62Encoder.decode(code);
    }
}
