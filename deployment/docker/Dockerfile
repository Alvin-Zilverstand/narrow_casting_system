# SnowWorld Narrowcasting System - Docker Configuration

# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY admin/package*.json ./admin/

# Install dependencies
RUN npm run setup:backend && npm run setup:admin

# Copy application code
COPY . .

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