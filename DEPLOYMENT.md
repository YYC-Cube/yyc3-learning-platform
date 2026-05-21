# 🚀 YYC³ Learning Platform — CI/CD & Deployment Guide

## 📋 Overview

This guide covers the complete CI/CD pipeline and deployment process for YYC³ Learning Platform to `learning.yyc3.top`.

## 🏗️ CI/CD Architecture

### Pipeline Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Code Push  │ -> │   Quality    │ -> │    Testing   │ │
│  │   (main)     │    │    Gate      │    │    Suite     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │    Build     │ -> │   Deploy     │ -> │   Verify     │ │
│  │   Static     │    │  Production  │    │   Live Site  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Workflows

#### 1. Enhanced CI/CD Pipeline (`enhanced-ci-cd.yml`)
- **Trigger**: Push to main/develop, PR, or manual
- **Phases**:
  - Code Quality & Security Scan
  - Parallel Testing (Unit, Integration, E2E)
  - Build & Deploy to GitHub Pages
  - Post-deployment Verification
  - Automated Notifications

#### 2. Production Deployment (`deploy-production.yml`)
- **Trigger**: Push to main (excluding docs)
- **Features**:
  - Pre-deployment validation
  - Quality gates enforcement
  - Comprehensive test suite
  - Production build optimization
  - Post-deployment verification
  - Detailed deployment reports

## 🔧 Configuration

### Required Secrets

Set these in GitHub repository settings (`Settings > Secrets and variables > Actions`):

```yaml
JWT_SECRET: Your JWT secret for production
CODECOV_TOKEN: Codecov token for coverage reports
```

### Environment Variables

The workflows use these environment variables:

```yaml
NODE_VERSION: '20'
PNPM_VERSION: '9'
PRODUCTION_DOMAIN: 'learning.yyc3.top'
```

## 📦 Deployment Process

### Automatic Deployment

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```

2. **GitHub Actions triggers automatically**
3. **Pipeline runs through all phases**
4. **Deployment to learning.yyc3.top**
5. **Post-deployment verification**

### Manual Deployment

#### Option 1: Using GitHub UI
1. Go to `Actions` tab
2. Select `Production Deployment — learning.yyc3.top`
3. Click `Run workflow`
4. Choose options:
   - Skip tests (emergency only)
   - Force deployment

#### Option 2: Using Deployment Script
```bash
# Standard deployment
./scripts/deploy-helper.sh

# Skip tests (not recommended)
./scripts/deploy-helper.sh --skip-tests

# Force deployment despite failures
./scripts/deploy-helper.sh --force
```

## 🔍 Pipeline Phases

### Phase 1: Code Quality & Security
- ✅ TypeScript type checking (zero errors)
- ✅ ESLint (zero warnings)
- ✅ Prettier format checking
- ✅ Security vulnerability scanning

### Phase 2: Testing
- **Unit Tests**: Vitest with 98.92% coverage
- **Integration Tests**: API and database integration
- **E2E Tests**: Playwright browser automation

### Phase 3: Build
- **Static Export**: Optimized for GitHub Pages
- **Image Optimization**: WebP/AVIF formats
- **Code Splitting**: Automatic lazy loading
- **Compression**: Gzip compression

### Phase 4: Deployment
- **GitHub Pages**: Automatic deployment
- **CNAME**: learning.yyc3.top configuration
- **SEO**: Optimized meta tags and sitemap

### Phase 5: Verification
- **HTTP Checks**: 200 OK validation
- **Critical Pages**: All main pages verified
- **Performance**: Core Web Vitals monitoring

## 📊 Monitoring & Logs

### GitHub Actions
- **Live Logs**: Actions tab in repository
- **Artifacts**: Coverage reports, test results
- **Deployment History**: Deployments page

### Site Monitoring
- **Health Endpoint**: `https://learning.yyc3.top/api/health`
- **Performance**: Core Web Vitals monitoring
- **Uptime**: Automated uptime checks

## 🚨 Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check pipeline status
gh run list --workflow=deploy-production.yml

# View specific run logs
gh run view <run-id> --log
```

#### 2. Tests Fail Locally
```bash
# Run failing tests locally
pnpm test:run

# Run specific test file
pnpm test path/to/test.test.ts
```

#### 3. Build Errors
```bash
# Clean build artifacts
rm -rf .next out node_modules
pnpm install
pnpm build
```

#### 4. Site Not Updating
```bash
# Clear GitHub Pages cache
# Go to Repository > Settings > Pages
# Click "Clear cache" button

# Force new deployment
./scripts/deploy-helper.sh --force
```

## 🎯 Best Practices

### Development Workflow
1. Create feature branch from `develop`
2. Make changes and test locally
3. Create PR to `main`
4. CI runs automatically
5. Merge triggers deployment

### Commit Messages
Follow conventional commits:
```bash
feat: new feature
fix: bug fix
docs: documentation update
perf: performance improvement
test: adding tests
```

### Pre-deployment Checklist
- [ ] All tests pass locally
- [ ] TypeScript compilation succeeds
- [ ] No ESLint warnings
- [ ] Security audit clean
- [ ] Manual testing completed
- [ ] Documentation updated

## 📈 Performance Metrics

### Build Performance
- **Average Build Time**: ~5 minutes
- **Test Execution**: ~3 minutes
- **Deployment Time**: ~2 minutes
- **Total Pipeline**: ~10 minutes

### Site Performance
- **Lighthouse Score**: 95+
- **Core Web Vitals**: Passing all metrics
- **Uptime**: 99.9%

## 🔗 Quick Links

- **Live Site**: https://learning.yyc3.top
- **GitHub Repository**: https://github.com/YYC-Cube/yyc3-learning-platform
- **CI/CD Status**: https://github.com/YYC-Cube/yyc3-learning-platform/actions
- **Deployment History**: https://github.com/YYC-Cube/yyc3-learning-platform/deployments

## 🆘 Support

For issues or questions:
- **GitHub Issues**: https://github.com/YYC-Cube/yyc3-learning-platform/issues
- **Email**: admin@0379.email
- **Documentation**: https://docs.yyc3.0379.email

---

> **YYC³ Learning Platform** — *Words Initiate Quadrants, Language Serves as Core for the Future*  
> **Deployment**: learning.yyc3.top | **Maintained by**: YYC³ Team