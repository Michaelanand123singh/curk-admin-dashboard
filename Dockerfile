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

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories and set proper permissions
RUN mkdir -p /var/run/nginx /var/log/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /var/run/nginx && \
    # Ensure nginx can write to these directories
    chmod 755 /var/run/nginx /var/log/nginx

# Switch to non-root user (nginx user already exists in the base image)
USER nginx

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]