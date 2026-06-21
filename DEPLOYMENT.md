# Deployment Guide

This document describes how to deploy TrimURL locally and to production cloud environments (AWS).

---

## Local Environment (Docker Compose)

Orchestrate the entire platform locally with one command:
```bash
docker-compose up -d --build
```

### Environment Variables Configured in Compose:
- `DB_HOST`: Service name `postgres`.
- `REDIS_HOST`: Service name `redis`.
- `KAFKA_HOST`: Service name `kafka`.
- `APP_BASE_URL`: Mapped to Nginx root address (`http://localhost`).

### Exposed Service Endpoints:
- **Web UI Client**: [http://localhost](http://localhost) (Nginx port 80).
- **Core API Gateway**: routes automatically through Nginx.
- **Prometheus scraper**: [http://localhost:9090](http://localhost:9090).
- **Grafana dashboard**: [http://localhost:3000](http://localhost:3000).

---

## Production AWS Deployment Target

To transition this platform to scale, replace the local container services with fully managed enterprise equivalents:

1. **ECS Fargate (Spring Boot Backend)**
   - Package the Spring Boot backend using the `backend/Dockerfile` and publish to AWS ECR.
   - Run tasks in ECS Fargate with target CPU and Memory thresholds for auto-scaling.
   - Place behind an **Application Load Balancer (ALB)** mapping requests to the container target groups on port 8080.

2. **AWS Aurora Serverless PostgreSQL**
   - Replace the local Postgres container with an Aurora multi-AZ cluster.
   - Set the database credentials securely in AWS Secrets Manager and expose as task variables to Fargate.

3. **AWS ElastiCache (Redis)**
   - Spin up a clustered Redis node to handle caching and token bucket operations.
   - Expose endpoints to the ECS security group.

4. **AWS MSK (Kafka)**
   - Replace the single-node local Kafka broker with Amazon Managed Streaming for Apache Kafka (MSK) for high-availability event partitioning.

5. **CloudFront & S3 (React Frontend)**
   - Compile the React bundle: `npm run build` inside `frontend/`.
   - Sync the static `dist/` directory contents to an Amazon S3 Bucket configured for static website hosting.
   - Place an Amazon CloudFront distribution in front of S3 to serve the application globally with minimal latency.
