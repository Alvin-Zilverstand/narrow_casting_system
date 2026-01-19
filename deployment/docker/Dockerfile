# SnowWorld Narrowcasting System - Docker Configuration

# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/
COPY backend/ ./backend/

# Copy admin package files
COPY admin/package*.json ./admin/
COPY admin/ ./admin/

# Copy client files
COPY client/ ./client/
COPY docs/ ./docs/
COPY deployment/ ./deployment/

# Install dependencies
RUN cd backend && npm ci && cd ..
RUN cd admin && npm ci && cd ..

# Copy application code
COPY test_system.js ./
COPY README.md ./
COPY PROJECT_SUMMARY.md ./
COPY CONTRIBUTING.md ./
COPY .env.example ./

# Create necessary directories
RUN mkdir -p database logs public/uploads/images public/uploads/videos

# Set permissions for upload directories
RUN chmod -R 755 public/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/zones', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start command
CMD ["npm", "start"]