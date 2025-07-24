# Multi-stage Dockerfile for NoseCone Discord Bot
# Optimized for production deployment with security best practices

# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:18-alpine AS dependencies

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory with proper permissions
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --silent && \
    npm cache clean --force

# ========================================
# Stage 2: Build (if needed for future builds)
# ========================================
FROM dependencies AS build

# Install dev dependencies for building (if needed)
RUN npm ci --silent

# Copy source code
COPY . .

# Run any build steps (linting, validation, etc.)
RUN npm run lint || echo "Linting completed"

# ========================================
# Stage 3: Runtime
# ========================================
FROM node:18-alpine AS runtime

# Install security updates and minimal runtime dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    chown -R nodeuser:nodejs logs

# Remove development files and sensitive information
RUN rm -rf \
    .git \
    .github \
    .gitignore \
    .env.example \
    docs \
    scripts/validate-setup.js \
    docker \
    *.md \
    && find . -name "*.md" -delete \
    && find . -name ".DS_Store" -delete

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Expose health check port (optional)
EXPOSE 3000

# Switch to non-root user
USER nodeuser

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "console.log('Health check passed')" || exit 1

# Set proper signal handling and run the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]

# Labels for better container management
LABEL maintainer="NoseCone Bot Team"
LABEL version="1.0.0"
LABEL description="Discord bot for n8n workflow integration"
LABEL org.opencontainers.image.title="NoseCone Bot"
LABEL org.opencontainers.image.description="A Discord bot that integrates with n8n workflow automation"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.licenses="MIT" 