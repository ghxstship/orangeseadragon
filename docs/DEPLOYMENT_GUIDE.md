# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOYMENT & ENVIRONMENT SETUP GUIDE
# ═══════════════════════════════════════════════════════════════════════════════
#
# This guide covers the deployment process and environment configuration
# for the GHXSTSHIP Platform schema-driven architecture.
#
# ═══════════════════════════════════════════════════════════════════════════════

## ENVIRONMENT REQUIREMENTS

### System Requirements
- **Node.js**: 18.17.0 or higher
- **npm**: 9.0.0 or higher
- **PostgreSQL**: 15.0 or higher (via Supabase)
- **Redis**: 7.0 or higher (optional, for caching)

### Infrastructure Requirements
- **Hosting**: Vercel, Netlify, or similar serverless platform
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for file uploads)
- **CDN**: Cloudflare or similar (optional)
- **Monitoring**: Sentry or similar (recommended)

## ENVIRONMENT VARIABLES

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database
DIRECT_URL=postgresql://username:password@host:port/database

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# External APIs (optional)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Environment Files
```bash
# .env.local (development)
# Local development overrides
DATABASE_URL=postgresql://localhost:5432/ghxstship_dev
NEXTAUTH_URL=http://localhost:3000

# .env.production (production)
# Production environment variables
DATABASE_URL=postgresql://prod-user:prod-pass@prod-host:5432/ghxstship_prod
NEXTAUTH_URL=https://app.ghxstship.com
```

## DATABASE SETUP

### Supabase Configuration

#### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project
supabase projects create "ghxstship-platform"
```

#### 2. Database Schema Migration
```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Apply all migrations
supabase db push

# Generate types from database
supabase gen types typescript --local > types/supabase.ts
```

#### 3. Storage Buckets Setup
```sql
-- Run in Supabase SQL editor
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('media', 'media', true),
  ('documents', 'documents', true),
  ('avatars', 'avatars', true),
  ('exports', 'exports', false);
```

#### 4. Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... enable RLS on all tables

-- Create basic organization-based policies
CREATE POLICY "Users can view their organization data" ON projects
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can modify their organization data" ON projects
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
```

## APPLICATION DEPLOYMENT

### Vercel Deployment (Recommended)

#### 1. Connect Repository
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

#### 2. Configure Build Settings
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 3. Environment Variables
```bash
# Set environment variables in Vercel dashboard or CLI
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all required variables
```

#### 4. Deploy
```bash
# Deploy to production
vercel --prod

# Or deploy preview
vercel
```

### Netlify Deployment (Alternative)

#### 1. Build Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Environment Variables
Set environment variables in Netlify dashboard under Site Settings > Environment Variables.

## POST-DEPLOYMENT CHECKLIST

### Database Verification
- [ ] All migrations applied successfully
- [ ] RLS policies working correctly
- [ ] Initial data seeded (organizations, admin user, etc.)
- [ ] Database indexes created and optimized

### Application Verification
- [ ] Homepage loads without errors
- [ ] Authentication working (login/logout)
- [ ] Basic CRUD operations functional
- [ ] File uploads working
- [ ] Email notifications configured

### Feature Testing
- [ ] User registration and onboarding
- [ ] Project creation and management
- [ ] Task assignment and tracking
- [ ] Document collaboration
- [ ] Financial operations (invoices, expenses)
- [ ] Reporting and analytics

### Performance Optimization
- [ ] Static assets optimized and cached
- [ ] Database queries optimized
- [ ] API response times under 500ms
- [ ] Bundle size reasonable (< 1MB initial load)

### Security Verification
- [ ] HTTPS enabled and configured
- [ ] Authentication tokens secure
- [ ] File upload restrictions working
- [ ] Rate limiting configured
- [ ] Audit logging enabled

## MONITORING & MAINTENANCE

### Application Monitoring
```typescript
// Sentry configuration (lib/sentry.ts)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Database Monitoring
```sql
-- Create monitoring views
CREATE VIEW system_health AS
SELECT
  schemaname,
  tablename,
  n_tup_ins AS inserts,
  n_tup_upd AS updates,
  n_tup_del AS deletes
FROM pg_stat_user_tables;

-- Query performance monitoring
CREATE VIEW slow_queries AS
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 1000  -- Queries taking > 1 second
ORDER BY mean_time DESC;
```

### Backup Strategy
```bash
# Daily database backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > backup_$DATE.sql.gz

# Keep last 30 days of backups
find /backups -name "backup_*.sql.gz" -mtime +30 -delete
```

## TROUBLESHOOTING DEPLOYMENT ISSUES

### Common Deployment Issues

#### Build Failures
**Issue**: `Module not found` errors
**Solution**:
- Check import paths in schema files
- Verify all field components exist
- Ensure relative imports are correct

**Issue**: TypeScript compilation errors
**Solution**:
- Run `npm run type-check` locally
- Fix any type definition issues
- Ensure all dependencies are installed

#### Runtime Errors
**Issue**: Database connection failures
**Solution**:
- Verify DATABASE_URL format
- Check Supabase project status
- Validate connection permissions

**Issue**: Authentication not working
**Solution**:
- Check NEXTAUTH configuration
- Verify Supabase auth settings
- Validate JWT token handling

#### Performance Issues
**Issue**: Slow page loads
**Solution**:
- Enable caching and CDN
- Optimize database queries
- Implement lazy loading
- Check bundle size

### Debug Commands
```bash
# Check application logs
vercel logs --follow

# Check database connections
psql $DATABASE_URL -c "SELECT version();"

# Test API endpoints
curl -H "Authorization: Bearer $TOKEN" https://api.your-domain.com/api/v1/projects

# Monitor performance
npm run lighthouse https://your-domain.com
```

## SCALING CONSIDERATIONS

### Database Scaling
- **Connection pooling**: Use PgBouncer for connection management
- **Read replicas**: Implement read/write splitting for high traffic
- **Caching**: Redis for session and query result caching
- **Archiving**: Move old data to separate tables or databases

### Application Scaling
- **Edge functions**: Deploy to multiple regions for global users
- **CDN**: Cloudflare for static asset delivery
- **Load balancing**: Distribute traffic across multiple instances
- **Auto-scaling**: Configure based on traffic patterns

### Storage Scaling
- **File organization**: Implement folder structures for large volumes
- **CDN integration**: Use multiple CDN regions
- **Compression**: Enable gzip/brotli compression
- **Backup strategy**: Automated offsite backups

## ROLLBACK PROCEDURES

### Application Rollback
```bash
# Vercel rollback
vercel rollback

# Or redeploy previous version
vercel deploy --target production@previous
```

### Database Rollback
```sql
-- Create restore point before major changes
CREATE DATABASE backup_db AS DATABASE current_db;

-- Rollback migration
-- Note: Requires careful planning, may lose data
ALTER TABLE table_name DROP COLUMN new_column;
```

### Emergency Procedures
1. **Assess impact**: Determine scope of issue
2. **Communicate**: Notify stakeholders of downtime
3. **Rollback**: Use deployment rollback procedures
4. **Investigate**: Analyze logs and error reports
5. **Fix**: Implement permanent solution
6. **Redeploy**: Test thoroughly before production release

## MAINTENANCE SCHEDULE

### Daily Tasks
- [ ] Monitor application logs for errors
- [ ] Check database performance metrics
- [ ] Verify backup completion
- [ ] Review security alerts

### Weekly Tasks
- [ ] Update dependencies and security patches
- [ ] Review and optimize slow queries
- [ ] Clean up old log files
- [ ] Test backup restoration

### Monthly Tasks
- [ ] Full security audit and penetration testing
- [ ] Performance optimization review
- [ ] User feedback analysis and feature prioritization
- [ ] Capacity planning and scaling assessment

### Quarterly Tasks
- [ ] Major version updates and migrations
- [ ] Infrastructure review and upgrades
- [ ] Compliance audits (GDPR, SOC2, etc.)
- [ ] Disaster recovery testing

---

## CONTACT & SUPPORT

### Deployment Support
- **Technical Issues**: support@ghxstship.com
- **Documentation**: docs.ghxstship.com
- **Community**: forum.ghxstship.com
- **Emergency**: +1 (555) 123-4567

### Monitoring Alerts
- **Critical**: Immediate response required (< 15 minutes)
- **High**: Response within 1 hour
- **Medium**: Response within 4 hours
- **Low**: Response within 24 hours

---

This deployment guide ensures reliable, secure, and scalable operation of the GHXSTSHIP Platform. Follow all procedures carefully and maintain regular monitoring for optimal performance.
