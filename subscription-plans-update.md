# Subscription Plans Update Implementation Plan

This plan outlines changes to subscription tiers, names, pricing list visual features, team member cappings, profile configuration for PayPal payouts, and the PayPal webhooks handler.

## Overview
We are updating the subscription plans for both **Translators** and **Companies** across the frontend and backend, refining enforcements for team sizing, adding a PayPal payout email input for translators, and preparing verification steps for PayPal webhook integrations.

---

## 1. Translator Subscription Tiers

### A. Free Member (Basic Lifetime Plan)
* **Setup Fee**: $0 (Free setup & onboarding)
* **Team Limit**: 0 colleagues (locked).
* **Escrow Fee**: 20% platform escrow fee (default).

### B. Pro Member (Renamed from Standard Member)
* **Setup Fee**: $0 (Free setup & onboarding)
* **Team Limit**: 0 colleagues (locked).
* **Language Limit**: Up to 5 languages.
* **Escrow Fee**: 10% platform fee on automatic payouts.
* **Features Removed**:
  - SMTP and WhatsApp notifications.
  - Direct PayPal Payouts enabled (this direct/manual text is removed).
* **Badge Renamed**: "Verified Translator badge" -> "Verified Pro Translator".
* **PayPal Payout Email**: Required input field under Translator Profile settings to route payments properly.

### C. Plus Member
* **Setup Fee**: $0 (Free setup & onboarding)
* **Team Limit**: Up to 3 colleagues as a team.
* **Team Member Specs**: These 3 team members get all **Pro Member** characteristics (5 languages, 10% escrow fee, automatic payouts) without extra fees.
* **Features Removed**:
  - SMTP, Email & instant WhatsApp notifications.
  - Premium support & priority job matching.

---

## 2. Company Subscription Tiers

### A. Free Tier
* **Setup Fee**: $0
* **Team Limit**: 0 colleagues (locked).

### B. Pro Business (Renamed from Standard Business)
* **Setup Fee**: $0
* **Team Limit**: Up to 3 accounts with **Translator Pro Member** capabilities.
* **Features Removed**:
  - Fast payout release (30 days automated).
  - SMTP and WhatsApp notifications.
  - Direct PayPal Payouts enabled.

### C. Plus Business (Renamed from Plus Corporate)
* **Setup Fee**: $0
* **Team Limit**: Up to 3 accounts with **Translator Plus Member** capabilities.
* **Features Removed**:
  - SMTP, Email & instant WhatsApp notifications.

---

## Proposed File Changes

### Frontend Changes

#### [MODIFY] [plans/page.tsx](file:///d:/Tranzlo/src/app/dashboard/plans/page.tsx)
* Update pricing grids, plan names, descriptions, and feature lists for both translator and company plans.
* Note that account setup and preparation is free across all plans.
* Change "Standard Member" -> "Pro Member" and "Standard Business" -> "Pro Business".
* Remove SMTP, WhatsApp, and premium features according to the specifications.

#### [MODIFY] [profile/page.tsx](file:///d:/Tranzlo/src/app/profile/page.tsx)
* Add a new input field for **PayPal Payout Email** for translators under the basic/professional details form.
* Ensure validation that it is a valid email and uses only PayPal.
* Save this field (`paypalEmail`) to the translator profile collection in Appwrite.
* Update language limit enforcements based on the new limits (Pro Member/Standard: 5 languages, Plus: 10, Free: 1).

#### [MODIFY] [translator/team/page.tsx](file:///d:/Tranzlo/src/app/dashboard/translator/team/page.tsx)
* Update validation check so that team addition is locked for Free and Pro Members.
* Only Plus Members can add up to 3 team members.
* Ensure clear alert/prompt when attempting to invite on Free or Pro tiers.

#### [MODIFY] [company/team/page.tsx](file:///d:/Tranzlo/src/app/dashboard/company/team/page.tsx)
* Implement planTier check logic similar to the translator team page.
* Lock team collaborators features for Free Companies.
* Allow Pro Business to invite up to 3 accounts with Translator Pro Member capabilities.
* Allow Plus Business (Corporate) to invite up to 3 accounts with Translator Plus Member capabilities.

### Backend & Webhook Changes

#### [MODIFY] [appwrite-function-paypal-webhook.js](file:///d:/Tranzlo/src/scripts/appwrite-function-paypal-webhook.js)
* Update subscription mapping dictionary (`PLAN_MAP`) to match the new names and mappings.
* Verify webhook processing logic for subscriptions and payouts is set up correctly.

---

## Verification Plan

### Automated Verifications
* Type check: `npx tsc --noEmit`
* Lint: `npm run lint`

### Manual Verification
1. Access the Plans page to check feature lists, names, and description changes.
2. Go to Translator Profile, toggle Edit mode, fill/save the PayPal payout email input field, and verify it updates the DB.
3. Attempt to use team pages on Free accounts to confirm the lock layout and upgrade warnings.
