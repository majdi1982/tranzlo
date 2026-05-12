# CORE DATABASE LAW

The database MUST behave as ONE unified ecosystem.

No isolated schema patterns.

No duplicated entity structures.

No inconsistent naming.

All collections MUST follow shared system standards.

---

# REQUIRED GLOBAL FIELDS

Every collection MUST include:

$id
publicId
entityType
createdAt
updatedAt
createdBy
updatedBy
status
visibility
metadata

---

# OWNERSHIP STRUCTURE

All entities MUST support:

organizationId
workspaceId
teamId
projectId
jobId
userId

---

# STANDARD STATUS VALUES

Allowed statuses:
- active
- inactive
- pending
- reviewing
- completed
- archived
- cancelled
- suspended

---

# MASTER USER STRUCTURE

users is the central identity collection.

Every role-specific collection MUST reference users.

Example:

users
 ├── translators
 ├── companies
 ├── employees
 ├── admins
 └── reviewers

---

# CORE COLLECTIONS

users
translators
companies
admins
employees
organizations
workspaces
teams
teamMembers
jobs
jobApplications
projects
projectTasks
milestones
messages
chatRooms
notifications
wallets
transactions
withdrawals
escrowHolds
refunds
invoices
reviews
portfolios
skills
languages
communityPosts
communityComments
blogPosts
blogComments
disputes
tickets
broadcasts
reports
files
attachments
auditLogs
securityLogs
activityLogs

---

# COLLECTION NAMING LAW

Collections:
- camelCase
- pluralized

Examples:
- jobApplications
- communityPosts
- teamMembers

Fields:
- camelCase only

---

# RELATIONSHIP LAW

All relations MUST use standardized names.

Examples:
- userId
- organizationId
- projectId
- transactionId
- workspaceId

Forbidden:
- random relation naming
- inconsistent patterns

---

# AUDIT SYSTEM LAW

Every critical action MUST create logs.

Collections:
- auditLogs
- securityLogs
- activityLogs
- adminLogs

Tracked actions:
- authentication
- payments
- disputes
- broadcasts
- permission changes
- deletions
- edits

---

# FINANCIAL LAW

All financial entities MUST generate:
- transactionId
- ledgerEntryId
- auditLogId

Collections:
- wallets
- transactions
- escrowHolds
- withdrawals
- refunds
- commissions
- invoices

---

# FILE STORAGE LAW

All uploaded files MUST use shared schema logic.

Required fields:
- fileId
- ownerId
- entityId
- entityType
- mimeType
- size
- storageProvider

---

# NOTIFICATION LAW

All notifications MUST originate from one unified structure.

notifications
 ├── messageNotifications
 ├── disputeNotifications
 ├── paymentNotifications
 ├── broadcastNotifications
 └── systemNotifications

---

# PERMISSION LAW

Permissions MUST be enforced server-side.

Forbidden:
- frontend-only security
- inline permission logic
- bypassing Appwrite rules

---

# FINAL DATABASE LAW

The database MUST remain:
- unified
- scalable
- indexed
- normalized
- secure
- auditable
- production-safe
```
