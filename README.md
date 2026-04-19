# Tranzlo Live Platform

Production-ready Next.js 16 + Appwrite + PayPal foundation for the Tranzlo translation marketplace.

## Required Environment

Copy your production values into `.env.local` or your VPS environment:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_USERS_COLLECTION_ID`
- `APPWRITE_TRANSLATOR_PROFILES_COLLECTION_ID`
- `APPWRITE_COMPANY_PROFILES_COLLECTION_ID`
- `APPWRITE_JOBS_COLLECTION_ID`
- `APPWRITE_APPLICATIONS_COLLECTION_ID`
- `APPWRITE_SUBSCRIPTIONS_COLLECTION_ID`
- `APPWRITE_TICKETS_COLLECTION_ID`
- `APPWRITE_NOTIFICATIONS_COLLECTION_ID`
- `APPWRITE_VERIFICATIONS_COLLECTION_ID`
- `APPWRITE_MESSAGES_COLLECTION_ID`
- `APPWRITE_STORAGE_BUCKET_CVS_ID`
- `APPWRITE_STORAGE_BUCKET_LOGOS_ID`
- `APPWRITE_STORAGE_BUCKET_PROFILE_FILES_ID`
- `APPWRITE_STORAGE_BUCKET_JOB_ATTACHMENTS_ID`
- `APPWRITE_STORAGE_BUCKET_TICKET_ATTACHMENTS_ID`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV`
- `PAYPAL_API_BASE`
- `N8N_BASE_URL`
- `N8N_API_KEY`

## Required Appwrite Collections

- `users`
- `translator_profiles`
- `company_profiles`
- `jobs`
- `job_applications`
- `subscriptions`
- `tickets`
- `notifications`
- `verifications`
- `messages`
- `billing_events`
- `webhook_logs`

## Required Buckets

- `cvs`
- `logos`
- `profile_files`
- `job_attachments`
- `ticket_attachments`
- `verification_documents`

## Deployment Notes

- Run the app on Ubuntu VPS with PM2.
- Put Nginx in front of the Next.js process.
- Keep SSL enabled for `tranzlo.net`, `appwrite.tranzlo.net`, and `n8n.tranzlo.net`.
- Configure PayPal webhooks against `/api/paypal/webhook`.
- Keep n8n calls non-blocking from user-facing flows.

## Current Status

The platform now has:

- safer Appwrite and PayPal helpers
- a live webhook route
- public marketing pages
- auth entry pages
- platform foundation helpers for roles, billing, and n8n events

Some flows still need real production IDs and backend wiring before go-live.

