package com.urlshortener.generator;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Base62Encoder.
 * No Spring context is needed — these are pure utility class tests.
 */
public class Base62EncoderTest {

    @Test
    public void testEncodeDecodeRoundTrip() {
        long[] testValues = {0L, 1L, 62L, 12345L, 999_999_999L, 56_800_235_584L};
        for (long val : testValues) {
            String encoded = Base62Encoder.encode(val);
            long decoded = Base62Encoder.decode(encoded);
            assertEquals(val, decoded, "Round-trip failed for value: " + val);
        }
    }

    @Test
    public void testEncodeNegativeValueThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> Base62Encoder.encode(-1));
    }

    @Test
    public void testDecodeInvalidCharacterThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> Base62Encoder.decode("abc_invalid!"));
    }

    @Test
    public void testDecodeEmptyStringThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> Base62Encoder.decode(""));
    }

    @Test
    public void testShortCodeLengthAtStartingSequence() {
        // Starting sequence is 62^6 = 56,800,235,584, ensuring 6+ character codes
        long startVal = 56_800_235_584L;
        String encoded = Base62Encoder.encode(startVal);
        assertTrue(encoded.length() >= 6,
                "Expected code length >= 6 but got " + encoded.length() + " for code: " + encoded);
    }

    @Test
    public void testNoCollisionsFor10000Urls() {
        // Simulate 10,000 sequential IDs from starting sequence
        long start = 56_800_235_584L;
        Set<String> codes = new HashSet<>();
        for (long i = start; i < start + 10_000; i++) {
            String code = Base62Encoder.encode(i);
            boolean isNew = codes.add(code);
            assertTrue(isNew, "Collision detected at id=" + i + " code=" + code);
        }
        assertEquals(10_000, codes.size(), "Expected 10000 unique codes");
    }

    @Test
    public void testAllCharactersAreAlphanumeric() {
        // Ensure all generated codes only use Base62 character set
        long start = 56_800_235_584L;
        for (long i = start; i < start + 1000; i++) {
            String code = Base62Encoder.encode(i);
            assertTrue(code.matches("[a-zA-Z0-9]+"),
                    "Code contains non-alphanumeric characters: " + code);
        }
    }
}
