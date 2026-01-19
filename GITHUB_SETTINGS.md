# GitHub Repository Settings Configuration

This document explains how to configure your GitHub repository for optimal CI/CD performance and security.

## 🔧 Required GitHub Settings

### 1. Repository Permissions for GitHub Actions

To enable GitHub Container Registry (ghcr.io) and proper CI/CD functionality:

1. Go to your repository settings: `https://github.com/YOUR_USERNAME/narrow_casting_system/settings`
2. Navigate to **Actions** → **General**
3. Under **Workflow permissions**, select:
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

### 2. Package Registry Settings

1. Go to your profile: `https://github.com/YOUR_USERNAME`
2. Click on **Packages**
3. Ensure package creation is enabled for your repository

## 🐳 Docker Configuration Options

### Option 1: GitHub Container Registry (Recommended - Already Configured)

Your current workflow uses GitHub Container Registry (ghcr.io) which:
- ✅ Works automatically with GitHub Actions
- ✅ Uses your existing GitHub credentials
- ✅ Provides good performance
- ✅ Free for public repositories

### Option 2: Docker Hub (If You Prefer)

If you want to use Docker Hub instead, you would need to:

1. Create a Docker Hub account at https://hub.docker.com
2. Create repository secrets in GitHub:
   - Go to Settings → Secrets and variables → Actions
   - Add `DOCKER_USERNAME` with your Docker Hub username
   - Add `DOCKER_PASSWORD` with your Docker Hub password
3. Update the workflow to use Docker Hub instead of ghcr.io

## 🔒 Security Settings

### Repository Security Settings
1. **Code security & analysis**:
   - Enable **Dependabot alerts**
   - Enable **CodeQL analysis**
   - Enable **Secret scanning"

2. **Branch protection** (for main branch):
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date before merging

### Current Security Status
- ✅ **Dependabot**: Enabled (will alert on vulnerable dependencies)
- ✅ **Security scanning**: Implemented in CI/CD pipeline
- ✅ **Package scanning**: Docker images are scanned for vulnerabilities

## 🚀 CI/CD Configuration

### Workflow Files
Your repository has two CI/CD workflows:

1. **`.github/workflows/ci.yml`** (Full pipeline with Docker)
   - Comprehensive testing
   - Docker image building
   - Security scanning
   - Multi-platform support (AMD64, ARM64)

2. **`.github/workflows/ci-simple.yml`** (Testing only)
   - Focused on testing without Docker
   - Faster builds
   - Good for development

### Workflow Permissions
The workflows require these permissions:
```yaml
permissions:
  contents: read      # Read repository contents
  packages: write     # Write to GitHub Container Registry
  security-events: write  # Upload security scan results
```

## 📊 Monitoring Your CI/CD

### GitHub Actions Dashboard
- Visit: `https://github.com/YOUR_USERNAME/narrow_casting_system/actions`
- View all workflow runs
- Check logs and results
- Download artifacts

### Security Dashboard
- Visit: `https://github.com/YOUR_USERNAME/narrow_casting_system/security`
- View security alerts
- Check dependency vulnerabilities
- Review security policies

## 🛠️ Current CI/CD Status

### What's Working
✅ **Automated Testing**: All tests run on every push
✅ **Security Auditing**: Dependencies are checked for vulnerabilities  
✅ **Multi-Node Testing**: Tests run on Node.js 18.x and 20.x
✅ **Security Scanning**: Code is scanned for security issues
✅ **Documentation**: Security considerations are documented

### What You Might See
⚠️ **Docker Login Issues**: If Docker push fails, the testing still works
⚠️ **Security Warnings**: Known sqlite3 vulnerabilities (documented)
⚠️ **Audit Warnings**: Some dependencies have known issues

## 🎯 Recommended Next Steps

### 1. Immediate Actions
- [ ] Check that GitHub Actions are running successfully
- [ ] Review any security alerts in your repository
- [ ] Test the application locally using the provided instructions

### 2. For Production Deployment
- [ ] Set up proper SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Consider migrating to better-sqlite3 for improved security

### 3. For Docker Deployment (Optional)
- [ ] Ensure GitHub Container Registry is enabled
- [ ] Test Docker deployment locally first
- [ ] Set up proper domain name and SSL

## 📞 Troubleshooting

### Common Issues

1. **GitHub Actions not running**
   - Check repository settings → Actions → General
   - Ensure Actions are enabled for the repository

2. **Docker login failures**
   - The current setup uses GitHub Container Registry (ghcr.io)
   - This should work automatically with GitHub Actions
   - If issues persist, check repository permissions

3. **Security audit failures**
   - The workflow continues despite security warnings
   - Check `docs/SECURITY_CONSIDERATIONS.md` for details
   - These are documented and acceptable for this use case

4. **Node.js version issues**
   - The workflow tests on Node.js 18.x and 20.x
   - Both versions are supported and should work

## 🔗 Useful Links

- **Repository**: https://github.com/Alvin-Zilverstand/narrow_casting_system
- **Actions**: https://github.com/Alvin-Zilverstand/narrow_casting_system/actions
- **Security**: https://github.com/Alvin-Zilverstand/narrow_casting_system/security
- **Packages**: https://github.com/Alvin-Zilverstand/narrow_casting_system/packages

---

**Note**: Your current setup uses GitHub Container Registry (ghcr.io) which is the recommended approach and should work automatically without additional configuration!