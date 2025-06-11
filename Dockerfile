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

# Health check using ES modules syntax
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "import('http').then(http => { http.get('http://localhost:3000/api/system/stats', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }) })"

CMD ["node", "server/index.js"]