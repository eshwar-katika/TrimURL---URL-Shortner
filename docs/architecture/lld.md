# Low Level Design (LLD)

This document covers details on core algorithm designs, rate-limiting logic, and system configurations.

## Base62 Short Code Encoding Strategy

We use Base62 encoding to transform a unique 64-bit auto-incrementing database ID into a clean short URL code. 
Character set: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789` (total 62 characters).

### The Math
An ID value of `100,000,000` translates to a short string:
* `100,000,000` base 10 = `LqZZ` base 62.
* Max length of short code is capped at 7 or 8 characters, supporting trillions of unique entries.
* To prevent guessing of consecutive URLs, we will use a Feistel cipher or custom bit-shuffling mechanism on the ID before base62 mapping, or utilize a high-range database sequence starting at a large number (e.g. `10,000,000,000`).

### Code Generator Class Design

```java
public class Base62Encoder {
    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int BASE = CHARACTERS.length();

    public static String encode(long value) {
        StringBuilder sb = new StringBuilder();
        while (value > 0) {
            sb.append(CHARACTERS.charAt((int) (value % BASE)));
            value /= BASE;
        }
        return sb.reverse().toString();
    }

    public static long decode(String code) {
        long result = 0;
        for (int i = 0; i < code.length(); i++) {
            result = result * BASE + CHARACTERS.indexOf(code.charAt(i));
        }
        return result;
    }
}
```

## Token Bucket Rate Limiter (Redis Lua script)

To throttle requests reliably across distributed nodes, we implement a Redis-based Token Bucket algorithm. We run it as an atomic Lua script inside a Spring Security filter.

### Lua Script Design
```lua
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill_rate = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local state = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(state[1])
local last_refill = tonumber(state[2])

if not tokens then
    tokens = capacity
    last_refill = now
else
    local elapsed = math.max(0, now - last_refill)
    tokens = math.min(capacity, tokens + elapsed * refill_rate)
end

if tokens >= 1 then
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, 60)
    return 1
else
    return 0
end
```
* **Key Format**: `ratelimit:{ip_address}`
* **Limit**: 100 requests per minute per IP.
* **Refill Rate**: 1.66 tokens/sec.
