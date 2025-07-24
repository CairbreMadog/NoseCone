# Docker Configuration for NoseCone Bot

This guide provides comprehensive instructions for containerizing and deploying the NoseCone Discord bot using Docker.

## 📋 Prerequisites

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- Basic knowledge of Docker and containerization
- Configured `.env` file with your Discord and n8n credentials

## 🐳 Docker Setup Options

### Option 1: Using Docker Compose (Recommended)

Docker Compose provides the easiest way to run NoseCone with all dependencies and configurations.

#### Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd NoseCone
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your Discord bot token, n8n webhook URLs, etc.
   ```

3. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Check logs:**
   ```bash
   docker-compose logs -f nosecone-bot
   ```

#### Docker Compose Commands

```bash
# Start the bot in background
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f nosecone-bot

# Stop the bot
docker-compose down

# Restart the bot
docker-compose restart nosecone-bot

# Update and restart
docker-compose pull && docker-compose up -d

# Remove everything (including volumes)
docker-compose down -v --remove-orphans
```

### Option 2: Using Dockerfile Only

For more control over the container configuration.

#### Build the Image

```bash
# Build the Docker image
docker build -t nosecone-bot .

# Build with specific tag
docker build -t nosecone-bot:1.0.0 .

# Build with build arguments
docker build --build-arg NODE_ENV=production -t nosecone-bot .
```

#### Run the Container

```bash
# Run with environment file
docker run -d \
  --name nosecone-bot \
  --restart unless-stopped \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  nosecone-bot

# Run with inline environment variables
docker run -d \
  --name nosecone-bot \
  --restart unless-stopped \
  -e DISCORD_BOT_TOKEN=your_token \
  -e DISCORD_CLIENT_ID=your_client_id \
  -e N8N_WEBHOOK_URL=your_webhook_url \
  -v $(pwd)/logs:/app/logs \
  nosecone-bot

# Run in interactive mode for debugging
docker run -it --rm \
  --env-file .env \
  nosecone-bot sh
```

#### Container Management

```bash
# View logs
docker logs -f nosecone-bot

# Stop the container
docker stop nosecone-bot

# Start the container
docker start nosecone-bot

# Restart the container
docker restart nosecone-bot

# Remove the container
docker rm nosecone-bot

# Execute commands in running container
docker exec -it nosecone-bot sh
```

## 📁 Docker Configuration Files

### Dockerfile Explanation

Our Dockerfile uses a multi-stage build for optimization:

```dockerfile
# Stage 1: Dependencies (cached layer)
FROM node:18-alpine AS dependencies
# Install only production dependencies

# Stage 2: Build (if needed)  
FROM dependencies AS build
# Install dev dependencies and run build steps

# Stage 3: Runtime
FROM node:18-alpine AS runtime
# Copy only production files and dependencies
```

**Key features:**
- Uses Alpine Linux for smaller image size
- Multi-stage build for optimization
- Non-root user for security
- Health check endpoint
- Proper signal handling

### Docker Compose Explanation

The `docker-compose.yml` provides:

- **Service Definition**: NoseCone bot service configuration
- **Volume Mounts**: Persistent logs and configuration
- **Environment Variables**: From `.env` file
- **Restart Policy**: Automatic restart on failure
- **Health Checks**: Container health monitoring
- **Networks**: Isolated network for security

## 🔧 Configuration Options

### Environment Variables

All environment variables from `.env` are automatically loaded:

```env
# Required
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/discord-bot

# Optional
N8N_WEBHOOK_TOKEN=auth_token
N8N_SECONDARY_WEBHOOK=https://your-n8n-instance.com/webhook/commands
BOT_PREFIX=!
COMMAND_CHANNEL_ID=channel_id
DEBUG_MODE=false
```

### Volume Mounts

| Host Path | Container Path | Purpose |
|-----------|----------------|---------|
| `./logs` | `/app/logs` | Persistent log storage |
| `./config` | `/app/config` | Configuration files |
| `./.env` | `/app/.env` | Environment variables |

### Port Exposure

The bot doesn't expose any ports by default since it's a Discord bot that connects outbound. However, you can add a health check endpoint:

```yaml
ports:
  - "3000:3000"  # Optional health check endpoint
```

## 🚀 Production Deployment

### Docker Swarm

For production clusters using Docker Swarm:

```bash
# Initialize swarm (if not already done)
docker swarm init

# Deploy the stack
docker stack deploy -c docker-compose.prod.yml nosecone

# Check services
docker service ls

# View logs
docker service logs -f nosecone_nosecone-bot

# Update service
docker service update --image nosecone-bot:latest nosecone_nosecone-bot
```

### Kubernetes

For Kubernetes deployment, see the `docker/k8s/` directory for:
- `deployment.yaml` - Main deployment configuration
- `configmap.yaml` - Configuration management
- `secret.yaml` - Sensitive data (tokens)
- `service.yaml` - Service definition (if needed)

### Resource Limits

Configure resource limits for production:

```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: "0.5"
    reservations:
      memory: 256M
      cpus: "0.25"
```

## 📊 Monitoring & Observability

### Health Checks

The container includes health checks:

```yaml
healthcheck:
  test: ["CMD", "node", "scripts/health-check.js"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Logging

Configure logging drivers:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

For centralized logging:

```yaml
logging:
  driver: "syslog"
  options:
    syslog-address: "tcp://logserver:514"
    tag: "nosecone-bot"
```

### Metrics Collection

Integration with monitoring systems:

```yaml
# Prometheus metrics (if implemented)
labels:
  - "prometheus.scrape=true"
  - "prometheus.port=3000"
  - "prometheus.path=/metrics"
```

## 🔒 Security Best Practices

### Container Security

1. **Non-root user**: Runs as `node` user, not root
2. **Read-only filesystem**: Where possible
3. **Security scanning**: Scan images for vulnerabilities
4. **Minimal base image**: Uses Alpine Linux
5. **No secrets in image**: All secrets via environment variables

### Network Security

```yaml
networks:
  nosecone-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Secrets Management

For production, use Docker secrets:

```yaml
secrets:
  discord_bot_token:
    external: true
  n8n_webhook_token:
    external: true

services:
  nosecone-bot:
    secrets:
      - discord_bot_token
      - n8n_webhook_token
```

## 🛠️ Development with Docker

### Development Compose

Use `docker-compose.dev.yml` for development:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# With hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### Debugging

Debug the containerized application:

```bash
# Run with debug mode
docker-compose -f docker-compose.debug.yml up

# Attach debugger
docker exec -it nosecone-bot-debug sh
```

### Testing

Run tests in container:

```bash
# Run tests
docker-compose run --rm nosecone-bot npm test

# Run linting
docker-compose run --rm nosecone-bot npm run lint

# Run validation
docker-compose run --rm nosecone-bot npm run validate
```

## 🐛 Troubleshooting

### Common Issues

1. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs nosecone-bot
   
   # Check container status
   docker-compose ps
   ```

2. **Environment variables not loaded:**
   ```bash
   # Verify .env file exists
   ls -la .env
   
   # Check environment in container
   docker exec nosecone-bot env
   ```

3. **Permission issues:**
   ```bash
   # Fix log directory permissions
   sudo chown -R 1000:1000 logs/
   
   # Or run with user override
   docker-compose run --user $(id -u):$(id -g) nosecone-bot
   ```

4. **Image build failures:**
   ```bash
   # Clean build with no cache
   docker-compose build --no-cache
   
   # Remove all containers and rebuild
   docker-compose down -v
   docker system prune -a
   docker-compose up --build
   ```

### Debug Commands

```bash
# Check container resources
docker stats nosecone-bot

# Inspect container configuration
docker inspect nosecone-bot

# Check network connectivity
docker exec nosecone-bot ping discord.com
docker exec nosecone-bot curl -I https://your-n8n-instance.com

# View container filesystem
docker exec -it nosecone-bot sh
ls -la /app
```

## 📈 Performance Optimization

### Image Size Optimization

- Use `.dockerignore` to exclude unnecessary files
- Multi-stage builds to reduce final image size
- Alpine Linux base image
- Clean up package manager cache

### Runtime Optimization

- Resource limits to prevent resource exhaustion
- Health checks for automatic recovery
- Proper restart policies
- Log rotation to prevent disk space issues

### Scaling

For high-traffic scenarios:

```yaml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
    failure_action: rollback
  rollback_config:
    parallelism: 1
    delay: 5s
```

## 🔄 CI/CD Integration

### GitHub Actions

Example workflow for automated builds:

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]
  
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t nosecone-bot .
      - name: Push to registry
        run: |
          docker tag nosecone-bot:latest registry/nosecone-bot:latest
          docker push registry/nosecone-bot:latest
```

### Automated Deployment

```bash
# Update and restart production service
docker service update --image nosecone-bot:latest nosecone_nosecone-bot

# Rolling update with health checks
docker service update --update-parallelism 1 --update-delay 10s nosecone_nosecone-bot
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 💡 Tips

1. **Use `.dockerignore`** to reduce build context size
2. **Pin versions** in Dockerfile for reproducible builds
3. **Use health checks** for better container management
4. **Mount logs volume** for persistent log storage
5. **Use secrets** for sensitive environment variables in production
6. **Regular updates** of base images for security patches
7. **Monitor resource usage** to optimize container limits 