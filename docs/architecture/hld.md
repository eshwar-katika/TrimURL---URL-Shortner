# High Level Design (HLD)

This document describes the high-level design components, interfaces, and request flows.

## Component Architecture

```mermaid
graph LR
    User([User Client]) -->|1. Request| Nginx[NGINX Gateway]
    Nginx -->|Route API| Backend[Spring Boot Service]
    Nginx -->|Route Page| Frontend[React SPA]
    
    Backend -->|Check/Update Limiter| RedisRate[Redis Rate Limiter]
    Backend -->|Read-through Mapping| RedisCache[Redis Cache]
    Backend -->|Auth Session / Transaction| Postgres[(PostgreSQL DB)]
    Backend -->|Produce Click Event| Kafka[Kafka Topics]
    
    KafkaConsumer[Kafka Click Consumer] -->|Consume Events| Kafka
    KafkaConsumer -->|Persist In Batch| Postgres
```

## Core Request Flows

### 1. Read-Through URL Redirection Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Gateway as NGINX Gateway
    participant API as Spring Boot App
    participant Redis as Redis Cache
    participant DB as PostgreSQL
    participant Kafka as Kafka Message Broker

    Client->>Gateway: GET /{shortCode}
    Gateway->>API: Route to Controller
    API->>Redis: Get long URL by shortCode
    alt Cache Hit
        Redis-->>API: Return long URL
    else Cache Miss
        Redis-->>API: Null
        API->>DB: Query URL record by shortCode
        alt URL Found
            DB-->>API: URL Details (longUrl, status, active)
            API->>Redis: Set shortCode -> longUrl (TTL: 24h)
        else URL Not Found / Expired
            DB-->>API: Null / Inactive
            API-->>Client: 404 Not Found
        end
    end
    API->>Kafka: Publish ClickEvent (shortCode, timestamp, userAgent, IP)
    API-->>Client: 302 Found (Redirect to long URL)
```

### 2. Async Click Analytics Pipeline

To ensure the redirect endpoint completes in under 50ms, writing analytics to the database is decoupled via Kafka:
* **Producer**: Inside the redirect endpoint, a lightweight Kafka producer publishes a `ClickEvent` to the `url-clicks` topic.
* **Consumer**: A background consumer group subscribes to `url-clicks`, aggregates/batches events, and writes them to PostgreSQL to minimize database connection and query overhead.
