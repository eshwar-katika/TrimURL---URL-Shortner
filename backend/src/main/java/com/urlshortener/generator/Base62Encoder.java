package com.urlshortener.generator;

public class Base62Encoder {
    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int BASE = CHARACTERS.length();

    public static String encode(long value) {
        if (value < 0) {
            throw new IllegalArgumentException("Value must be non-negative");
        }
        if (value == 0) {
            return String.valueOf(CHARACTERS.charAt(0));
        }
        StringBuilder sb = new StringBuilder();
        long temp = value;
        while (temp > 0) {
            sb.append(CHARACTERS.charAt((int) (temp % BASE)));
            temp /= BASE;
        }
        return sb.reverse().toString();
    }

    public static long decode(String code) {
        if (code == null || code.isEmpty()) {
            throw new IllegalArgumentException("Code cannot be empty");
        }
        long result = 0;
        for (int i = 0; i < code.length(); i++) {
            char c = code.charAt(i);
            int index = CHARACTERS.indexOf(c);
            if (index == -1) {
                throw new IllegalArgumentException("Invalid character in Base62 code: " + c);
            }
            result = result * BASE + index;
        }
        return result;
    }
}
