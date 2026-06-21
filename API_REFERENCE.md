# API Reference

This document outlines the REST API endpoints provided by the TrimURL backend.

---

## Authentication Endpoints

### 1. Register User
Creates a new account and returns a session JWT.
* **URL**: `/auth/register`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "username": "coder123",
  "email": "coder@example.com",
  "password": "strongPassword1"
}
```
* **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.ey...",
  "username": "coder123",
  "email": "coder@example.com"
}
```

### 2. Login User
Authenticates user credentials and returns a session JWT.
* **URL**: `/auth/login`
* **Method**: `POST`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
```json
{
  "username": "coder123",
  "password": "strongPassword1"
}
```
* **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.ey...",
  "username": "coder123",
  "email": "coder@example.com"
}
```

---

## URL Management Endpoints

All endpoints below (except Redirection) require the following Authorization Header:
`Authorization: Bearer <JWT_TOKEN>`

### 3. Create Short URL
Shortens a target long URL. Optionally accepts a custom alias and expiration timestamp.
* **URL**: `/api/v1/urls`
* **Method**: `POST`
* **Request Body**:
```json
{
  "longUrl": "https://deepmind.google/technologies/gemini/",
  "customAlias": "geminidemo",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```
* **Response (201 Created)**:
```json
{
  "id": 56800235584,
  "shortCode": "geminidemo",
  "longUrl": "https://deepmind.google/technologies/gemini/",
  "shortUrl": "http://localhost/geminidemo",
  "createdAt": "2026-06-21T12:00:00Z",
  "expiresAt": "2026-12-31T23:59:59Z",
  "status": "ACTIVE",
  "clickCount": 0
}
```

### 4. Delete Short URL
Removes a shortened URL and invalidates its Redis cache mapping.
* **URL**: `/api/v1/urls/{shortCode}`
* **Method**: `DELETE`
* **Response (244 No Content)**: Empty payload.

### 5. List User URLs
Retrieves all URLs shortened by the authenticated user.
* **URL**: `/api/v1/urls`
* **Method**: `GET`
* **Response (200 OK)**:
```json
[
  {
    "id": 56800235584,
    "shortCode": "geminidemo",
    "longUrl": "https://deepmind.google/technologies/gemini/",
    "shortUrl": "http://localhost/geminidemo",
    "createdAt": "2026-06-21T12:00:00Z",
    "expiresAt": "2026-12-31T23:59:59Z",
    "status": "ACTIVE",
    "clickCount": 12
  }
]
```

---

## Redirection Endpoint

### 6. Low Latency Redirection
Redirects the client to the destination long URL.
* **URL**: `/{shortCode}`
* **Method**: `GET`
* **Headers (Optional)**: `User-Agent` (used to record browser and device metrics)
* **Response (302 Found)**: Redirects to target location via `Location` header.
* **Response (404 Not Found)**: If code does not exist or has expired.

---

## Analytics Endpoints

### 7. Get URL Click Statistics
Retrieves aggregates mapping geo, browser, device, and history metrics for charts.
* **URL**: `/api/v1/urls/{shortCode}/stats`
* **Method**: `GET`
* **Response (200 OK)**:
```json
{
  "totalClicks": 12,
  "byCountry": [
    { "name": "India", "value": 7 },
    { "name": "United States", "value": 5 }
  ],
  "byBrowser": [
    { "name": "Chrome", "value": 8 },
    { "name": "Safari", "value": 4 }
  ],
  "byDevice": [
    { "name": "Mobile", "value": 9 },
    { "name": "Desktop", "value": 3 }
  ],
  "clickHistory": [
    { "date": "2026-06-21", "count": 12 }
  ]
}
```
