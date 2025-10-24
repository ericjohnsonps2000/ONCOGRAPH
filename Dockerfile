# OncoGraph Docker Configuration
# Multi-stage build for production-ready container

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY frontend/ ./

# Build the application
RUN npm run build

# Stage 2: Production server
FROM nginx:alpine AS production

# Copy built application to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Development variant
FROM node:18-alpine AS development

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY frontend/ ./

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]