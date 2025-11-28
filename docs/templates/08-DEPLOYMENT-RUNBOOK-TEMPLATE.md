---
# YAML Frontmatter - Metadata for Semantic Search & RAG
document_type: "deployment-runbook"  # REQUIRED: Type identifier for MCP/RAG
module: "[module-name]"  # REQUIRED: e.g., "backend", "frontend", "infrastructure"
status: "approved"  # REQUIRED: draft | in-review | approved | deprecated
version: "1.0.0"  # REQUIRED: Semantic versioning (Major.Minor.Patch)
last_updated: "YYYY-MM-DD"  # REQUIRED: ISO date format
author: "@username"  # REQUIRED: GitHub username or team

# Keywords for semantic search (5-10 keywords)
keywords:
  - "deployment"
  - "runbook"
  - "operations"
  - "devops"
  - "[environment]"  # e.g., "production", "staging", "development"
  - "[strategy]"  # e.g., "blue-green", "canary", "rolling"
  - "rollback"
  - "ci-cd"
  - "monitoring"

# Related documentation
related_docs:
  database_schema: ""  # Path to DB schema (for migration planning)
  api_design: ""  # Path to API design
  feature_design: ""  # Path to feature design
  testing_strategy: ""  # Path to testing strategy
  security_audit: ""  # Path to security audit

# Deployment-specific metadata
deployment_metadata:
  environment: "production"  # "development" | "staging" | "production"
  deployment_frequency: "weekly"  # e.g., "daily", "weekly", "on-demand"
  deployment_strategy: "blue-green"  # "rolling" | "blue-green" | "canary" | "recreate"
  rollback_time: "5 minutes"  # e.g., "5 minutes", "< 1 hour"
  zero_downtime: true  # Whether deployment causes downtime
  automation_level: "full"  # "manual" | "semi-automated" | "full"
---

<!-- AI-INSTRUCTION: START -->
<!--
  This document is a TEMPLATE for Deployment Runbook Documentation.

  PURPOSE: Define deployment procedures, rollback strategies, and operational playbooks ONLY.

  CRITICAL RULES:
  1. NO infrastructure code (Dockerfile, k8s manifests, terraform)
  2. NO application code or feature implementation
  3. NO monitoring tool configuration details
  4. FOCUS ON: Deployment steps, rollback procedures, health checks, incident response

  WHERE TO DOCUMENT OTHER ASPECTS:
  - Infrastructure Code → docker/, k8s/, terraform/ directories
  - Application Code → apps/*/src/ directories
  - Monitoring Config → observability/ or infra/ directories
  - Architecture Decisions → docs/technical/architecture/adr/

  Keep this document as the Single Source of Truth for DEPLOYMENT PROCEDURES only.
-->
<!-- AI-INSTRUCTION: END -->

<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td width="120" align="center" valign="middle">
      <img src="../../libs/assets/src/images/logo.png" width="80" alt="Project Logo" />
    </td>
    <td align="left" valign="middle">
      <h1 style="margin: 0; border-bottom: none;">Deployment Runbook: [Environment/Service Name]</h1>
      <p style="margin: 0; color: #6e7681; font-size: 1.1em;">Operational Procedures & Incident Response</p>
    </td>
  </tr>
</table>

<div align="center">

  <!-- METADATA BADGES -->
  <img src="https://img.shields.io/badge/Status-Approved-green?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Environment-Production-red?style=flat-square" alt="Environment" />
  <img src="https://img.shields.io/badge/Zero%20Downtime-Yes-green?style=flat-square" alt="Downtime" />
  <img src="https://img.shields.io/badge/Last%20Updated-YYYY--MM--DD-lightgrey?style=flat-square" alt="Date" />

</div>

---

## Agent Directives (System Prompt)

_This section contains mandatory instructions for AI Agents (Copilot, Cursor, etc.) interacting with this document._

| Directive      | Instruction                                                                     |
| :------------- | :------------------------------------------------------------------------------ |
| **Context**    | This document defines deployment procedures for [Environment/Service].          |
| **Scope**      | ONLY deployment steps, rollback procedures, health checks, incident response.   |
| **Constraint** | NO infrastructure code, NO application code, NO monitoring tool configurations. |
| **Related**    | [Feature Design], [Testing Strategy], [Security Audit]                          |
| **Pattern**    | Blue-Green deployment, automated rollback, comprehensive health checks.         |

---

## 1. Executive Summary

_High-level overview of deployment strategy._

**Service/Environment:** [e.g. "Payment System Backend - Production"]

**Deployment Strategy:** [e.g. "Blue-Green with automated health checks"]

**Key Characteristics:**

- **Frequency:** [e.g. "Weekly releases every Friday at 2 PM UTC"]
- **Duration:** [e.g. "~15 minutes from start to completion"]
- **Downtime:** [e.g. "Zero downtime with blue-green switching"]
- **Rollback Time:** [e.g. "< 5 minutes to previous version"]

**Critical Success Factors:**

1. All health checks pass before traffic switch
2. Database migrations complete successfully
3. Zero failed transactions during deployment
4. Rollback capability available at all times

---

## 2. Pre-Deployment Checklist

**Complete this checklist before every deployment:**

### 2.1. Code & Tests

- [ ] All CI/CD tests pass (unit, integration, E2E)
- [ ] Code review approved by at least 2 team members
- [ ] No critical bugs in staging environment
- [ ] Performance tests pass (if applicable)
- [ ] Security scan completed (no critical vulnerabilities)

### 2.2. Database

- [ ] Database migrations tested in staging
- [ ] Backup of production database taken
- [ ] Migration rollback script prepared
- [ ] No breaking schema changes (or coordinated with backend release)

### 2.3. Infrastructure

- [ ] Sufficient resources available (CPU, memory, disk)
- [ ] SSL certificates valid (not expiring within 30 days)
- [ ] DNS records configured correctly
- [ ] CDN cache invalidation plan ready (if needed)

### 2.4. Communication

- [ ] Deployment scheduled in team calendar
- [ ] Stakeholders notified (if user-facing changes)
- [ ] Incident response team on standby
- [ ] Rollback authority designated (who can approve rollback)

### 2.5. Monitoring

- [ ] Monitoring dashboards accessible
- [ ] Alert thresholds reviewed
- [ ] Log aggregation working
- [ ] Error tracking (Sentry/Rollbar) configured

---

## 3. Deployment Procedure

### 3.1. Overview

**Strategy:** Blue-Green Deployment

```text
┌─────────────┐     ┌─────────────┐
│   BLUE      │     │   GREEN     │
│ (Current)   │     │ (New)       │
├─────────────┤     ├─────────────┤
│ Version 1.5 │     │ Version 1.6 │
│ Active ✓    │     │ Idle        │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └───────┬───────────┘
               │
       ┌───────▼────────┐
       │  Load Balancer │
       │   (Routes to   │
       │     BLUE)      │
       └────────────────┘
```

**Steps:**

1. Deploy new version to GREEN environment
2. Run health checks on GREEN
3. Switch traffic from BLUE to GREEN
4. Monitor for errors
5. Keep BLUE running for quick rollback

---

### 3.2. Step-by-Step Instructions

#### Step 1: Prepare Deployment

**Time:** 5 minutes

```bash
# 1. Set environment variables
export DEPLOY_VERSION="v1.6.0"
export DEPLOY_ENV="production"
export DEPLOY_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 2. Create deployment log
echo "Deployment started: $DEPLOY_TIME" > deploy.log

# 3. Notify team (Slack webhook)
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"DEPLOYMENT: Starting $DEPLOY_VERSION (User: $USER)\"}"
```

**Validation:**

- [ ] Environment variables set correctly
- [ ] Team notified in Slack #deployments channel

---

#### Step 2: Database Migration (if applicable)

**Time:** 2-5 minutes

**CRITICAL:** Run migrations BEFORE deploying application code to ensure backward compatibility.

```bash
# 1. Backup database (automated)
npm run db:backup -- --env production

# 2. Run migrations
npm run prisma:migrate:deploy -- --schema=./prisma/schema.prisma

# 3. Verify migration success
npm run prisma:migrate:status
```

**Validation:**

- [ ] Backup completed successfully
- [ ] All pending migrations applied
- [ ] No migration errors in logs

**Rollback (if migration fails):**

```bash
# Restore from backup
npm run db:restore -- --backup-id=<backup-id>
```

---

#### Step 3: Deploy Application to GREEN

**Time:** 3-5 minutes

```bash
# 1. Build Docker image
docker build -t payment-system-backend:$DEPLOY_VERSION .

# 2. Tag image
docker tag payment-system-backend:$DEPLOY_VERSION \
  registry.example.com/payment-system-backend:$DEPLOY_VERSION

# 3. Push to registry
docker push registry.example.com/payment-system-backend:$DEPLOY_VERSION

# 4. Deploy to GREEN environment (Kubernetes)
kubectl set image deployment/backend-green \
  backend=registry.example.com/payment-system-backend:$DEPLOY_VERSION \
  --namespace=production

# 5. Wait for rollout
kubectl rollout status deployment/backend-green --namespace=production
```

**Validation:**

- [ ] Docker image built successfully
- [ ] Image pushed to registry
- [ ] Pods running and ready (check with `kubectl get pods`)

---

#### Step 4: Health Check GREEN Environment

**Time:** 2-3 minutes

**Run comprehensive health checks before switching traffic:**

```bash
# 1. HTTP Health check
curl -f https://green.api.payment-system.com/health || exit 1

# 2. Database connectivity check
curl -f https://green.api.payment-system.com/health/db || exit 1

# 3. API smoke tests
npm run test:smoke -- --target=https://green.api.payment-system.com

# 4. Check metrics (error rate, latency)
# Open Grafana dashboard and verify:
# - Error rate < 0.1%
# - P95 latency < 200ms
# - All services reporting as healthy
```

**Validation:**

- [ ] `/health` endpoint returns 200 OK
- [ ] `/health/db` endpoint returns 200 OK
- [ ] Smoke tests pass (all critical API endpoints working)
- [ ] Error rate < 0.1% in Grafana
- [ ] Latency < 200ms (P95) in Grafana

**If health checks fail:**

- **DO NOT PROCEED** - investigate and fix issues in GREEN
- Check logs: `kubectl logs -l app=backend-green --namespace=production`
- Notify team of failure and begin troubleshooting

---

#### Step 5: Switch Traffic (Blue → Green)

**Time:** 1 minute

**CRITICAL POINT:** This is when users start hitting the new version.

```bash
# 1. Update load balancer to route to GREEN
kubectl patch service backend-service \
  --namespace=production \
  -p '{"spec":{"selector":{"version":"green"}}}'

# 2. Verify traffic switch
curl https://api.payment-system.com/version
# Expected output: {"version": "1.6.0", "environment": "green"}

# 3. Monitor error rate in real-time
watch -n 5 'curl -s https://api.payment-system.com/metrics | grep error_rate'
```

**Validation:**

- [ ] Load balancer updated successfully
- [ ] `/version` endpoint returns new version
- [ ] Traffic is routing to GREEN pods (check logs)

---

#### Step 6: Monitor & Validate

**Time:** 10-15 minutes

**Post-deployment monitoring period:**

```bash
# 1. Monitor error rate (should stay < 0.1%)
# Open Grafana: https://grafana.payment-system.com/d/deployment-dashboard

# 2. Check for exceptions in Sentry
# Open Sentry: https://sentry.io/payment-system/

# 3. Monitor key business metrics
# - Transactions per minute (should remain stable)
# - Payment success rate (should be > 99%)
# - Average response time (should be < 200ms)

# 4. Check logs for errors
kubectl logs -l app=backend-green --tail=100 --namespace=production
```

**Validation (15 minutes after traffic switch):**

- [ ] Error rate < 0.1% (same as pre-deployment)
- [ ] No new critical errors in Sentry
- [ ] Transaction rate stable
- [ ] Payment success rate > 99%
- [ ] No customer complaints

**If validation fails:**

- Initiate rollback immediately (see Section 4)

---

#### Step 7: Decommission BLUE

**Time:** 1 minute

**Only after GREEN is stable for 15+ minutes:**

```bash
# 1. Scale down BLUE environment
kubectl scale deployment backend-blue --replicas=0 --namespace=production

# 2. Keep BLUE image for 24 hours (in case of late-discovered issues)
# After 24 hours, can delete:
# kubectl delete deployment backend-blue --namespace=production
```

**Validation:**

- [ ] BLUE pods scaled down to 0
- [ ] GREEN handling 100% of traffic
- [ ] Rollback still possible (BLUE image exists)

---

### 3.3. Deployment Completion

```bash
# 1. Mark deployment as successful
echo "Deployment completed: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> deploy.log

# 2. Notify team
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"SUCCESS: Deployment $DEPLOY_VERSION completed successfully\"}"

# 3. Update deployment tracking
git tag -a $DEPLOY_VERSION -m "Production deployment"
git push origin $DEPLOY_VERSION
```

**Validation:**

- [ ] Deployment log updated
- [ ] Team notified in Slack
- [ ] Git tag created and pushed

---

## 4. Rollback Procedure

**EXECUTE IMMEDIATELY if:**

- Error rate > 1% for 5+ minutes
- Critical functionality broken (payments failing)
- Database corruption detected
- Security vulnerability discovered

### 4.1. Quick Rollback (< 5 minutes)

```bash
# 1. Switch traffic back to BLUE
kubectl patch service backend-service \
  --namespace=production \
  -p '{"spec":{"selector":{"version":"blue"}}}'

# 2. Verify rollback
curl https://api.payment-system.com/version
# Expected: {"version": "1.5.0", "environment": "blue"}

# 3. Notify team
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"ROLLBACK ALERT: Reverted to $PREVIOUS_VERSION\"}"

# 4. Scale down GREEN
kubectl scale deployment backend-green --replicas=0 --namespace=production
```

**Validation:**

- [ ] Traffic reverted to BLUE
- [ ] Error rate returns to normal
- [ ] Team notified of rollback

---

### 4.2. Database Rollback (if migration causes issues)

**ONLY if database changes cause critical issues:**

```bash
# 1. Stop application traffic (maintenance mode)
kubectl scale deployment backend-green --replicas=0 --namespace=production
kubectl scale deployment backend-blue --replicas=0 --namespace=production

# 2. Restore database from backup
npm run db:restore -- --backup-id=<pre-deployment-backup-id>

# 3. Verify restoration
npm run db:verify -- --expected-version=<previous-version>

# 4. Restart BLUE application
kubectl scale deployment backend-blue --replicas=3 --namespace=production

# 5. Resume traffic
kubectl patch service backend-service \
  --namespace=production \
  -p '{"spec":{"selector":{"version":"blue"}}}'
```

**Validation:**

- [ ] Database restored to pre-deployment state
- [ ] Application starts successfully
- [ ] All functionality working

---

## 5. Post-Deployment Tasks

### 5.1. Immediate (Within 1 hour)

- [ ] Update deployment documentation with any lessons learned
- [ ] Review monitoring dashboards for anomalies
- [ ] Check for any user-reported issues (support tickets, social media)
- [ ] Update status page if changes affect users

### 5.2. Within 24 Hours

- [ ] Conduct post-deployment review meeting
- [ ] Document any issues encountered during deployment
- [ ] Update runbook if process changed
- [ ] Archive deployment logs

### 5.3. Within 1 Week

- [ ] Review performance metrics vs. previous version
- [ ] Analyze error logs for new patterns
- [ ] Gather feedback from team on deployment process
- [ ] Update deployment automation if needed

---

## 6. Incident Response

### 6.1. Severity Levels

| Level | Description                  | Response Time | Escalation            |
| :---- | :--------------------------- | :------------ | :-------------------- |
| P0    | Critical (payments down)     | Immediate     | Page on-call engineer |
| P1    | Major (degraded performance) | < 15 minutes  | Notify team lead      |
| P2    | Minor (isolated errors)      | < 1 hour      | Create ticket         |
| P3    | Low (cosmetic issues)        | < 1 day       | Backlog               |

---

### 6.2. Incident Response Steps

**For P0/P1 Incidents:**

1. **Assess:** Check monitoring dashboards, error rates, logs
2. **Communicate:** Notify team in #incidents Slack channel
3. **Mitigate:** Roll back if deployment-related, otherwise apply hotfix
4. **Resolve:** Fix root cause
5. **Document:** Write incident report

**Incident Commander:** Person who initiated deployment

**Communication Template:**

```text
🚨 INCIDENT: [Brief Description]
Severity: P0/P1
Started: [Time]
Impact: [User-facing impact]
Actions Taken: [List actions]
Status: Investigating / Mitigating / Resolved
```

---

## 7. Monitoring & Alerting

### 7.1. Key Metrics

| Metric                   | Normal Range | Alert Threshold | Action             |
| :----------------------- | :----------- | :-------------- | :----------------- |
| Error Rate               | < 0.1%       | > 1%            | Investigate / Rollback |
| API Latency (P95)        | < 200ms      | > 500ms         | Investigate performance |
| Database Connections     | < 50         | > 80            | Scale database pool |
| CPU Usage                | < 70%        | > 85%           | Scale pods          |
| Memory Usage             | < 80%        | > 90%           | Investigate memory leak |
| Payment Success Rate     | > 99%        | < 98%           | CRITICAL - Investigate immediately |

---

### 7.2. Monitoring Tools

- **Grafana:** https://grafana.payment-system.com/d/production-dashboard
- **Sentry:** https://sentry.io/payment-system/
- **Logs:** `kubectl logs -l app=backend --namespace=production`
- **Metrics:** Prometheus (http://prometheus.payment-system.com)

---

## 8. Emergency Contacts

| Role                      | Name   | Slack         | Phone        |
| :------------------------ | :----- | :------------ | :----------- |
| On-Call Engineer          | [Name] | @oncall       | +1-XXX-XXXX  |
| DevOps Lead               | [Name] | @devops-lead  | +1-XXX-XXXX  |
| Engineering Manager       | [Name] | @eng-manager  | +1-XXX-XXXX  |
| Database Administrator    | [Name] | @dba          | +1-XXX-XXXX  |
| Security Team (Incidents) | [Name] | @security     | +1-XXX-XXXX  |

---

## 9. Related Documentation

- [Testing Strategy](./07-TESTING-STRATEGY.md)
- [Security Audit](./09-SECURITY-AUDIT.md)
- [Database Schema](../backend/database/04-INVENTORY-SCHEMA.md)
- [API Design](../backend/api/PRODUCTS-API.md)

---

## Appendix A: Change Log

| Date       | Version | Author   | Changes                        |
| :--------- | :------ | :------- | :----------------------------- |
| YYYY-MM-DD | 1.0.0   | @DevOps  | Initial deployment runbook     |

---

## Appendix B: Tool References

- **Kubernetes:** https://kubernetes.io/docs/
- **Docker:** https://docs.docker.com/
- **Grafana:** https://grafana.com/docs/
- **Sentry:** https://docs.sentry.io/
