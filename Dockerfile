FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S smartdock -u 1001

# Create necessary directories and set permissions
RUN mkdir -p /app/data && chown -R smartdock:nodejs /app

USER smartdock

EXPOSE 3000

# Simple health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server/index.js"]