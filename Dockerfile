# Multi-stage build for Admin Dashboard - Optimized for GCP Cloud Run
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Production stage with nginx
FROM nginx:1.25-alpine

# Install dumb-init for proper signal handling in Cloud Run
RUN apk add --no-cache dumb-init

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Create nginx pid directory
RUN mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Switch to non-root user
USER nginx

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
