# Docker Deployment for SnowWorld Narrowcasting System

This directory contains Docker configuration files for deploying the SnowWorld Narrowcasting System.

## 🐳 Quick Start with Docker

### Prerequisites
- Docker Engine 20.10+
- Docker Compose v2.0+

### Build and Run

```bash
# Navigate to docker directory
cd deployment/docker

# Build and run with Docker Compose v2
docker compose up -d

# Or build manually from root directory
docker build -f deployment/docker/Dockerfile -t snowworld-narrowcasting .
docker run -d -p 3000:3000 --name snowworld snowworld-narrowcasting
```

### Access the Application
- Main application: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin
- Client display: http://localhost:3000/client?zone=reception

### Docker Compose v2 Commands
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild services
docker compose build --no-cache
```

## 📋 Docker Compose Services

### Services Overview
- **snowworld-narrowcasting**: Main application container
- **nginx**: Reverse proxy with SSL termination

### Volumes
- `./database:/app/database` - Persistent database storage
- `./logs:/app/logs` - Application logs
- `./public/uploads:/app/public/uploads` - Uploaded media files

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
NODE_ENV=production
PORT=3000
DB_PATH=./database/snowworld.db
```

### SSL Configuration
For production deployment with SSL:
1. Place SSL certificates in `./ssl/` directory
2. Update `nginx.conf` with your domain name
3. Ensure certificates are named `cert.pem` and `key.pem`

## 🚀 Production Deployment

### 1. Prepare Environment
```bash
# Copy environment file
cp .env.example .env

# Create necessary directories
mkdir -p database logs ssl public/uploads/{images,videos}

# Set permissions
chmod -R 755 public/uploads
```

### 2. SSL Certificates
```bash
# For Let's Encrypt (recommended)
certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem
```

### 3. Deploy with Docker Compose
```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📊 Monitoring

### Container Health
```bash
# Check container health
docker-compose ps

# View logs
docker-compose logs snowworld-narrowcasting
docker-compose logs nginx

# Monitor resources
docker stats
```

### Application Health
The application includes health check endpoints:
- API Health: http://localhost:3000/api/zones
- WebSocket: ws://localhost:3000/socket.io

## 🔧 Maintenance

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup
```bash
# Backup database
docker exec snowworld-narrowcasting sqlite3 /app/database/snowworld.db ".backup /app/database/backup.db"

# Backup uploads
tar -czf uploads-backup.tar.gz public/uploads/
```

### Logs Management
```bash
# View application logs
docker-compose logs -f snowworld-narrowcasting

# Rotate logs
docker-compose exec snowworld-narrowcasting logrotate -f /etc/logrotate.conf
```

## 🚨 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs snowworld-narrowcasting

# Rebuild if necessary
docker-compose build --no-cache
```

**Port already in use:**
```bash
# Find process using port 3000
netstat -tulpn | grep 3000

# Or use different port
# Edit docker-compose.yml ports section
```

**Database permission errors:**
```bash
# Fix permissions
sudo chown -R $USER:$USER database/
chmod -R 755 database/
```

**SSL certificate issues:**
```bash
# Check certificate validity
openssl x509 -in ssl/cert.pem -text -noout

# Verify nginx configuration
nginx -t
```

### Performance Issues

**High memory usage:**
```bash
# Monitor memory
docker stats snowworld-narrowcasting

# Check for memory leaks
docker exec snowworld-narrowcasting node --inspect
```

**Slow response times:**
```bash
# Check nginx access logs
docker-compose logs nginx | grep "upstream_response_time"

# Monitor database performance
docker exec snowworld-narrowcasting sqlite3 /app/database/snowworld.db "PRAGMA compile_options;"
```

## 🔒 Security

### Container Security
- Run as non-root user when possible
- Keep base images updated
- Scan images for vulnerabilities
- Use secrets management for sensitive data

### Network Security
- Use Docker networks for isolation
- Implement proper firewall rules
- Enable SSL/TLS for all communications
- Regular security updates

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale with Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml snowworld-stack

# Or use Kubernetes (see k8s/ directory)
kubectl apply -f k8s/
```

### Load Balancing
The nginx configuration includes upstream load balancing for multiple app instances.

## 🧪 Development with Docker

### Local Development
```bash
# Development docker-compose
docker-compose -f docker-compose.dev.yml up -d

# With hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### Testing in Container
```bash
# Run tests in container
docker exec snowworld-narrowcasting npm test

# Interactive debugging
docker exec -it snowworld-narrowcasting /bin/sh
```

---

For more information, see the main project documentation in `/docs/` directory.