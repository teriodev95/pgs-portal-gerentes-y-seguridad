# =============================================================================
# Stage 1: Build Stage
# =============================================================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using install instead of ci due to lock file sync issues)
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_MAPBOX_KEY
ARG VITE_APP_VERSION
ARG VITE_IMAGEKIT_PUBLIC
ARG VITE_IMAGEKIT_PRIVATE
ARG VITE_IMAGEKIT_ID
ARG TELEGRAM_BOT_TOKEN
ARG TELEGRAM_CHAT_ID

# Set environment variables for build
ENV VITE_MAPBOX_KEY=$VITE_MAPBOX_KEY \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_IMAGEKIT_PUBLIC=$VITE_IMAGEKIT_PUBLIC \
    VITE_IMAGEKIT_PRIVATE=$VITE_IMAGEKIT_PRIVATE \
    VITE_IMAGEKIT_ID=$VITE_IMAGEKIT_ID \
    TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN \
    TELEGRAM_CHAT_ID=$TELEGRAM_CHAT_ID \
    NODE_ENV=production

# Build the application (build-only to skip type-check for faster Docker builds)
# Use 'npm run build' if you want type-checking during Docker build
RUN npm run build-only

# =============================================================================
# Stage 2: Production Stage with Nginx
# =============================================================================
FROM nginx:1.27-alpine AS production

# Install runtime utilities
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata

# Set timezone (optional, adjust as needed)
ENV TZ=America/Mexico_City

# Remove default nginx config
RUN rm -rf /usr/share/nginx/html/* \
    && rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Create nginx user for security
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
