# PRODUCTION LAW

Production MUST run ONLY through Docker Compose.

Forbidden:
- PM2
- manual node processes
- npm start
- random ports
- unmanaged services

---

# REQUIRED CONTAINERS

Mandatory services:

services:
  frontend:
  appwrite:
  redis:
  n8n:
  nginx:
  workers:

---

# REQUIRED PROJECT STRUCTURE

/root/
└── tranzlo-project/
     ├── appwrite/
     ├── frontend/
     ├── n8n/
     ├── redis/
     ├── workers/
     ├── nginx/
     ├── logs/
     ├── docker-compose.yml
     └── .env

---

# NETWORK ARCHITECTURE

Internet
   ↓
Nginx Reverse Proxy
   ├── tranzlo.net → frontend
   ├── www.tranzlo.net → frontend
   ├── appwrite.tranzlo.net → appwrite
   └── n8n.tranzlo.net → n8n

---

# DOCKER RULES

Mandatory:
- named volumes
- restart unless-stopped
- healthchecks
- environment isolation
- internal Docker networking
- isolated services

Forbidden:
- exposing internal services publicly
- mixing environments
- duplicate compose files
- hardcoded secrets

---

# NGINX RULES

Responsibilities:
- SSL termination
- reverse proxy
- websocket support
- gzip compression
- security headers
- caching

---

# SSL LAW

All public domains MUST use HTTPS.

Domains:
- tranzlo.net
- www.tranzlo.net
- appwrite.tranzlo.net
- n8n.tranzlo.net

SSL Provider:
- Let's Encrypt

Cloudflare:
- NOT USED

---

# APPWRITE RULES

Appwrite MUST remain isolated.

Do NOT merge Appwrite inside frontend container.

Appwrite responsibilities:
- auth
- database
- storage
- realtime
- functions

---

# REDIS RULES

Redis responsibilities:
- caching
- queues
- rate limiting
- realtime optimization
- notifications

---

# N8N RULES

n8n responsibilities:
- PayPal webhooks
- emails
- automations
- scheduled jobs
- moderation workflows

---

# WORKER RULES

Workers MUST remain isolated containers.

Examples:
- email workers
- AI workers
- OCR workers
- notification workers

---

# BACKUP LAW

Required backups:
- Appwrite volumes
- Redis persistence
- uploads
- environment files
- nginx configs

Backups MUST be:
- automated
- daily
- rollback-ready

---

# SECURITY LAW

Mandatory:
- firewall
- fail2ban
- SSL
- secure headers
- container isolation
- secrets management

Forbidden:
- exposed admin ports
- unsecured APIs
- public Redis

---

# DEPLOYMENT FLOW

GitHub
   ↓
VPS Pull
   ↓
Docker Compose Build
   ↓
Healthchecks
   ↓
Nginx Reverse Proxy
   ↓
SSL
   ↓
Production

---

# FINAL PRODUCTION LAW

The infrastructure MUST remain:
- Docker-first
- scalable
- secure
- isolated
- production-ready
- maintainable
```
