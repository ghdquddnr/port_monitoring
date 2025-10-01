# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source files
COPY . .

# Build Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install required system packages for port monitoring
RUN apk add --no-cache \
    iptables \
    lsof \
    sudo \
    shadow

# Set environment to production
ENV NODE_ENV=production

# Create nextjs user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy necessary files from builder
# Public folder may not exist, so we skip it
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package.json for reference
COPY --from=builder /app/package.json ./package.json

# Create .env file placeholder
RUN touch .env && chown nextjs:nodejs .env

# Grant sudo permissions to nextjs user for specific commands
RUN echo "nextjs ALL=(ALL) NOPASSWD: /usr/sbin/iptables, /usr/bin/lsof, /usr/bin/kill, /bin/systemctl" >> /etc/sudoers

# Switch to nextjs user
USER nextjs

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
