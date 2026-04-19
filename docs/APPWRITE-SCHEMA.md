# Appwrite Collections Schema

This document defines the required collections and attributes for the Tranzlo platform based on the CSV specifications.

## 1. Plans (`plans`)
**Purpose**: Store subscription plans for translators and companies.

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `plan_id` | String | Yes | Primary Key (e.g., `translator_pro_monthly`) |
| `audience_type` | String | Yes | `translator` or `company` |
| `plan_name` | String | Yes | e.g., "Pro", "Enterprise" |
| `billing_period` | String | Yes | `monthly`, `yearly`, `custom` |
| `price_usd` | Float | Yes | Plan price |
| `trial_days` | Integer | Yes | Default: 30 |
| `is_active` | Boolean | Yes | Default: true |
| `badge_text` | String | No | e.g., "Most Popular" |

## 2. Plan Features (`planFeatures`)
**Purpose**: Store reusable features that can be assigned to plans.

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `feature_id` | String | Yes | e.g., `priority_jobs` |
| `audience_type` | String | Yes | `translator` or `company` |
| `feature_group` | String | Yes | e.g., "Visibility", "Support" |
| `feature_name` | String | Yes | Display name |

## 3. Subscriptions (`subscriptions`)
**Purpose**: Track active and past user subscriptions.

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `subscription_id` | String | Yes | |
| `user_id` | String | Yes | Appwrite User ID |
| `audience_type` | String | Yes | `translator` or `company` |
| `plan_id` | String | Yes | Related plan |
| `status` | String | Yes | `active`, `trialing`, `canceled`, `past_due` |
| `trial_end_at` | Datetime | No | |
| `provider_subscription_id` | String | No | PayPal ID |

## 4. UI Visibility Rules (`uiVisibilityRules`)
**Purpose**: Drive dynamic UI components if needed.

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `page_name` | String | Yes | |
| `component_name` | String | Yes | |
| `show_when` | String | Yes | Logic string |

---

### Implementation Instructions
1. Create a Database named `tranzlo` (or use the ID in `.env`).
2. Create the collections listed above.
3. Add the attributes with correct types.
4. Set Permissions:
    - **Plans**: Read (Role: All), Write (Role: Admin)
    - **Subscriptions**: Read (Role: Owner), Write (Role: Admin/Owner)
