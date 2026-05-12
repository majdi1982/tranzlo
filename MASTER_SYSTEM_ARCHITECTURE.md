# CORE ARCHITECTURE

## Required Stack
- Next.js 16
- React 19
- TypeScript Strict Mode
- TailwindCSS
- Appwrite Self-Hosted
- Appwrite Realtime
- Redis
- n8n
- Docker Compose
- Nginx Reverse Proxy
- Let's Encrypt SSL

---

# DOCKER-FIRST POLICY

Everything MUST run inside Docker containers.

FORBIDDEN:
- PM2
- manual node processes
- npm start in production
- mixed deployment methods
- unmanaged services

REQUIRED:
- docker compose
- restart policies
- named volumes
- healthchecks
- isolated services
- internal docker networking

---

# UNIFIED SYSTEM RULES

The platform MUST behave as ONE connected ecosystem.

No isolated architectures.

No duplicate systems.

No conflicting patterns.

All services MUST follow:
- shared naming conventions
- shared permission systems
- shared ID systems
- shared audit systems
- shared database logic

---

# USER SYSTEM

Supported roles:
- translator
- reviewer
- proofreader
- company_owner
- employee
- admin
- super_admin

Users MAY have multiple roles.

---

# UNIVERSAL ID LAW

Every entity MUST generate globally unique readable IDs.

Examples:

TRZ-USER-XXXXXX
TRZ-TRN-XXXXXX
TRZ-CMP-XXXXXX
TRZ-JOB-XXXXXX
TRZ-PRJ-XXXXXX
TRZ-TKT-XXXXXX
TRZ-DSP-XXXXXX
TRZ-TXN-XXXXXX

Rules:
- immutable
- indexed
- searchable
- collision-safe

---

# SECURITY PRIORITY

Priority Order:
1. Security
2. Architecture consistency
3. Database integrity
4. Permission integrity
5. Scalability
6. Backend systems
7. Realtime systems
8. UI polish

---

# FORBIDDEN REFACTORS

Antigravity MUST NOT:
- rewrite working infrastructure
- replace Docker architecture
- recreate auth systems
- duplicate APIs
- duplicate collections
- rename collections randomly
- create conflicting schemas
- bypass Appwrite permissions
- replace unified architecture

---

# REQUIRED ENGINEERING STANDARDS

Mandatory:
- TypeScript strict mode
- reusable services
- modular architecture
- validation everywhere
- centralized permissions
- centralized audit logging
- scalable structure

Forbidden:
- any type
- inline business logic
- duplicated logic
- insecure uploads
- frontend-only security
- mock production data

---

# ANTIGRAVITY VALIDATION LAYER

Before writing code Antigravity MUST verify:
- schema consistency
- Docker compatibility
- Appwrite compatibility
- role compatibility
- permission integrity
- naming consistency
- production readiness

If implementation conflicts with architecture:
STOP.
Adapt implementation.
DO NOT replace architecture.

---

# FINAL RULE

The platform MUST remain:
- Docker-first
- scalable
- production-ready
- modular
- secure
- unified
- enterprise-capable
```