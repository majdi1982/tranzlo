# Tranzlo System Architecture

This document describes the production server architecture and deployment topology of Tranzlo on VPS (`187.124.179.33`).

---

## 🏗️ Server Directory Layout

```plaintext
/root/
├── tranzlo/                         # Production Compose Stacks
│   ├── frontend/
│   │   ├── docker-compose.yml       # Next.js web app (Port 3000)
│   │   └── .env                     # Production env credentials
│   ├── listmonk/
│   │   ├── docker-compose.yml       # Listmonk (Port 9000) & Postgres DB
│   │   └── config.toml              # Listmonk settings
│   └── redis/
│       └── docker-compose.yml       # Redis session/cache stack
│
├── tranzlo-project/                 # Deployment working directory (Git repository)
│   ├── deploy.sh                    # Remote orchestration deployment script
│   └── ...
│
└── appwrite/                        # Appwrite backend deployment (Port 8080)
    └── docker-compose.yml
```

---

## 🌐 Network & Routing Architecture

```mermaid
graph TD
    Client[Web Client] -->|Ports 80/443| HostNginx[Host System Nginx]
    
    subgraph Docker Network: tranzlo-net (External)
        Frontend[tranzlo-frontend:3000]
        Listmonk[tranzlo-listmonk:9000]
        Postgres[tranzlo-listmonk-db:5432]
        Redis[tranzlo-redis:6379]
    end
    
    subgraph Appwrite Docker Stack
        Appwrite[Appwrite:8080]
    end

    HostNginx -->|tranzlo.net / localhost:3000| Frontend
    HostNginx -->|mail.tranzlo.net / localhost:9000| Listmonk
    HostNginx -->|appwrite.tranzlo.net / localhost:8080| Appwrite

    Frontend -->|Query Cache| Redis
    Listmonk -->|Store Data| Postgres
```

### 1. Host Nginx Proxying
The system-wide Nginx server runs directly on the host VPS listening on ports `80` and `443` (handling Let's Encrypt SSL certificates). It proxies requests to the loopback address of the host:
* **`tranzlo.net` & `www.tranzlo.net`** $\rightarrow$ `http://localhost:3000` (Next.js frontend container)
* **`mail.tranzlo.net`** $\rightarrow$ `http://localhost:9000` (Listmonk container)
* **`appwrite.tranzlo.net`** $\rightarrow$ `http://localhost:8080` (Appwrite Traefik gateway)

### 2. External Shared Network (`tranzlo-net`)
All modular Compose services reside on a pre-created external Docker bridge network called `tranzlo-net`:
```bash
docker network create tranzlo-net
```
This enables container-to-container communication (e.g. Next.js connects to Redis at `tranzlo-redis:6379` and Listmonk connects to Postgres at `tranzlo-listmonk-db:5432`).

---

## 🚀 Deployment Flow

---

---

## 📝 Blog Content Generation

### Content Format Standard
All generated content uses **Markdown** (`##` for H2, `###` for H3). The frontend renders both Markdown and HTML content (auto-detected).

### API Generator (`POST /api/blog/generate`)
- **ML Models**: Gemini 2.5 Flash (primary) → OpenRouter (fallback)
- **Prompt**: Brand voice (professional, authoritative, data-driven), 1000-1500 words output, SEO-optimized
- **Pipeline**: Scrape competitor article → AI generation (Markdown) → Gemini Imagen cover image → Save as `pending_review`
- **SEO Fields Stored**: `primaryKeyword`, `wordCount`, `readingTime`, `generatedBy`, `category` (unified slugs)

### RSS Auto-Publisher
- Same Gemini 2.5 Flash model with enhanced prompt for translation-industry focus
- Saves `generatedBy: "news"` and unified category slugs
- Word count target: 800-2000 words

### Unified Category System
Single source of truth in `src/constants/categories.ts`:
```
translation-tech → AI & Translation Tech
career-growth    → Linguist & Career Growth
industry-trends  → Industry Insights & Trends
best-practices   → Best Practices & Guides
platform-news    → Platform News & Updates
general          → General
```
Includes backward-compatible aliases for RSS and AI generation outputs.

### Blog Post Model (`src/types/blog.ts`)
Extended fields:
- `primaryKeyword` — Main SEO keyword for the article
- `wordCount` — Total word count for SEO scoring
- `readingTime` — Calculated minutes to read (based on 200 wpm)
- `generatedBy` — `"ai"` | `"news"` | `"manual"`

---

## 🤖 Blog Automation (Appwrite Functions)

Three Appwrite Functions handle blog automation:

### 1. RSS Auto-Publisher (`rss-auto-publisher`)
- **Schedule**: Every 12 hours (`0 */12 * * *`)
- **Source**: RSS feeds (Google Blog, Dev.to - translation/localization tags)
- **Pipeline**: Fetch RSS → Parse XML → Gemini AI enrichment (title, content, tags, SEO) → Save to `blog_posts` as `pending_review`
- **Deploy**: `npm run deploy:rss-publisher`

### 2. Scheduled Publisher (`tranzlo-scheduled-publisher`)
- **Schedule**: Every 10 minutes (`*/10 * * * *`)
- **Pipeline**: Query `blog_posts` where `status === "scheduled"` and `scheduledAt <= now` → Publish → Share to social media
- **Deploy**: `npm run deploy:scheduled-publisher`

### 3. Social Publisher (HTTP-triggered)
- **Trigger**: POST `{ postId }` (called after publish)
- **Platforms**: X/Twitter (v2 API), Facebook (Graph API), LinkedIn (UGC Posts API)
- **Tokens**: `TWITTER_BEARER_TOKEN`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `LINKEDIN_ACCESS_TOKEN`

### Local Scripts
- `npm run rss:publish` — Run RSS fetch locally (requires `GEMINI_API_KEY`)
- `npm run deploy:rss-publisher` — Deploy RSS function to Appwrite
- `npm run deploy:scheduled-publisher` — Deploy scheduled publisher function

---

## 🚀 Deployment Flow

Deployments are executed from the developer workstation using `deploy.bat`, which performs the following pipeline:

1. Commits local changes and pushes them to the remote git repository.
2. Synchronizes configurations and scripts to `/root/tranzlo-project/` via `scp`.
3. Executes `/root/tranzlo-project/deploy.sh` remotely on the VPS, which:
   * Syncs the frontend source code and configurations to `/root/tranzlo/frontend`.
   * Distributes compose files to `frontend/`, `listmonk/`, and `redis/` folders.
   * Starts Redis, Listmonk, and Next.js Frontend stacks independently.
   * Auto-detects and installs database schemas for Listmonk on first run.
