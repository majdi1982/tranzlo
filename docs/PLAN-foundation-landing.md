# PLAN: Foundation & Landing

## Phase -1: Context Check
- **Project**: Tranzlo Translation Marketplace
- **Objective**: Complete Phase A (Foundation) and prepare for Phase 1 (Subscriptions & Onboarding).
- **Stakeholders**: Translator, Company, Admin.

## Phase 0: Socratic Gate (Status)
- [x] Questions asked about Audience, Appwrite, and UI strategy.
- [x] Approved by user ("ok", "continue").
- [x] Assumptions: Balanced landing page, Vanilla premium UI, Appwrite setup guide required.

## Phase 1: Foundation Completion (Current)
### Task 1.1: Complete Public Pages
- **Deliverable**: Functional shells for remaining marketing routes.
- **Files**:
    - `app/(public)/marketplace/page.tsx`
    - `app/(public)/about/page.tsx`
- **Owner**: Frontend Specialist

### Task 1.2: Authentication Shells
- **Deliverable**: Login and Register pages with role selection support.
- **Files**:
    - `app/(auth)/login/page.tsx`
    - `app/(auth)/register/page.tsx`
- **Owner**: Frontend Specialist

### Task 1.3: Appwrite Collections Schema
- **Deliverable**: Documentation/Script defining the collections based on `appwrite_collections_hint.csv`.
- **Files**: `docs/APPWRITE-SCHEMA.md`
- **Owner**: Backend Specialist

## Phase 2: Design System Expansion
### Task 2.1: Shared UI Primitives
- **Deliverable**: Input, Badge, Dialog, and Table components.
- **Files**: `components/ui/*.tsx`
- **Owner**: Frontend Specialist

## Phase 3: Bridge to Business Logic (Phase 1 CSV)
### Task 3.1: Plan Fetching Logic
- **Deliverable**: Service to fetch plans from Appwrite (mocked first).
- **Files**: `services/plans.ts`
- **Owner**: Backend Specialist

## Verification Checklist
- [ ] All public routes in `publicNav` resolve without 404.
- [ ] Register page includes "I am a Translator" vs "I am a Company" toggle.
- [ ] Appwrite client connects (verified via console logs).
- [ ] Theme switching (Dark/Light) works on all base layouts.
