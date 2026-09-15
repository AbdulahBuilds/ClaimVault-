# KeepSafe — Master Project Specification

## IMPORTANT INSTRUCTIONS FOR ANTIGRAVITY

You are building a real mobile application called **KeepSafe**.

This document is the single source of truth for the project.

DO NOT try to complete the entire project in one step.

The project is divided into phases.

You MUST work through the phases in order.

After completing each phase:

1. Inspect the existing project.
2. Implement only the current phase.
3. Test the current phase.
4. Fix errors before continuing.
5. Check that existing functionality still works.
6. Update the project documentation/progress if appropriate.
7. Stop and wait for the next instruction before starting the next phase.

Never skip phases.

Never rewrite working code unnecessarily.

Never replace the existing architecture just because another approach looks easier.

Prioritize maintainability, clean UX, reusable components and a production-ready foundation.

---

# PRODUCT OVERVIEW

## Product Name

KeepSafe

## Product Category

Personal purchase, warranty and receipt management mobile application.

## Core Problem

People purchase products such as:

- Smartphones
- Laptops
- ACs
- Refrigerators
- Washing machines
- TVs
- Appliances
- Electronics
- Other expensive products

After purchasing them, people often forget:

- Purchase date
- Purchase price
- Store
- Return deadline
- Warranty duration
- Warranty expiry date
- Where the receipt is stored

KeepSafe solves this by allowing users to store all purchase information in one place and receive reminders before important deadlines.

---

# CORE VALUE PROPOSITION

The product should communicate one simple message:

> **Never lose track of what you bought.**

KeepSafe helps users:

- Store purchase information
- Store receipts
- Track return periods
- Track warranties
- Receive reminders
- Quickly find purchase information

---

# TARGET USER

Primary users:

- Students
- Families
- Working professionals
- People purchasing electronics/appliances
- Anyone who wants to organize receipts and warranties

Initial market:

Pakistan

However, the application must be designed so that it can later support international users.

---

# PRODUCT PRINCIPLES

Always prioritize:

1. Simplicity
2. Reliability
3. Speed
4. Clear information
5. Mobile-first UX
6. Accessibility
7. Maintainable architecture
8. Scalable architecture
9. Minimal third-party dependency
10. User privacy

Avoid unnecessary complexity.

---

# TECHNOLOGY

## Mobile

React Native

## Development Platform

Expo

## Language

TypeScript

## Navigation

Expo Router

## Styling

NativeWind / Tailwind-style utility classes

## Icons

Lucide icons or another consistent icon library

## Backend

Later phase:

Node.js

NestJS

TypeScript

## Database

Later phase:

PostgreSQL

## Storage

Later phase:

Cloud object storage such as S3-compatible storage or another suitable provider.

## Notifications

Expo Notifications initially.

## AI / OCR

Later phase.

Do not implement AI before the dedicated AI phase.

---

# ARCHITECTURE PRINCIPLES

Use a clean feature-based architecture.

Avoid:

- One giant file
- Duplicated components
- Hardcoded data everywhere
- UI mixed with business logic
- Unnecessary global state
- Premature microservices
- Over-engineering

Prefer:

- Reusable components
- Typed models
- Services
- Hooks where appropriate
- Feature-based folders
- Clear separation of concerns

Example direction:

```text
src/
├── app/
├── components/
├── features/
│   ├── auth/
│   ├── products/
│   ├── receipts/
│   ├── reminders/
│   └── profile/
├── services/
├── hooks/
├── types/
├── constants/
├── utils/
└── data/
```

Adapt this structure to the actual Expo Router project when necessary.

---

# DESIGN SYSTEM

KeepSafe must have a premium, modern and trustworthy visual identity.

## Primary Colors

Navy:

#123B5D

Meaning:
Trust / important information / headings

Teal:

#0F8B8D

Meaning:
Actions / buttons / verified states

Orange:

#F59E0B

Meaning:
Attention / upcoming deadlines / warnings

Green:

#16A34A

Meaning:
Success / active / completed

Red:

#DC2626

Meaning:
Errors / expired / critical states

Background:

#F8FAFC

Secondary text:

#64748B

Border:

#E2E8F0

White:

#FFFFFF

---

# COLOR RULES

Do not randomly use colors.

Use:

GREEN:
Active / safe / completed

ORANGE:
Expiring soon / upcoming

RED:
Expired / overdue / destructive action

TEAL:
Primary actions

NAVY:
Headings / important information

GRAY:
Secondary information

---

# UI STYLE

The application should feel like a serious startup product.

Use:

- Clean typography
- Good spacing
- Subtle borders
- Subtle shadows
- Compact cards
- Clear hierarchy
- Proper empty states
- Proper loading states
- Proper error states
- Consistent buttons
- Consistent iconography

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Giant cards
- Cartoon illustrations
- Random colors
- Excessive rounded corners
- Template-looking UI
- Overly decorative interfaces

---

# NAVIGATION

Use bottom tab navigation.

Tabs:

1. Home
2. Products
3. Add
4. Reminders
5. Profile

The Add action should be visually prominent.

---

# DATA MODEL

The initial product model should support:

```text
Product

id
name
brand
model
category
purchaseDate
purchasePrice
currency
storeName
returnDeadline
warrantyDuration
warrantyExpiryDate
receiptUri
notes
createdAt
updatedAt
```

Design this model so it can later be connected to PostgreSQL.

---

# PHASE SYSTEM

The following phases must be completed in order.

---

# PHASE 01 — FOUNDATION

## Objective

Create the application foundation.

Implement:

- Expo project structure
- TypeScript
- Expo Router
- Navigation
- Theme
- Color system
- Typography
- Reusable components
- Bottom navigation
- Basic screens

Create placeholder screens for:

Home

Products

Add

Reminders

Profile

Authentication screens may be created but should not yet contain real authentication.

## Reusable Components

Create:

Button

Input

Card

Badge

Header

EmptyState

LoadingState

ProductCard

ReminderCard

Do not duplicate these components.

## Acceptance Criteria

The app:

- Runs successfully
- Opens without errors
- Navigation works
- All five tabs work
- Design system is consistent
- No broken routes
- No placeholder lorem ipsum

STOP AFTER THIS PHASE.

---

# PHASE 02 — ONBOARDING & AUTHENTICATION

## Objective

Build the complete onboarding and authentication experience.

Create:

### Onboarding

Screen 1:

Never Miss a Warranty Again

Screen 2:

Keep Your Receipts Safe

Screen 3:

Get Reminded Before It's Too Late

Buttons:

Skip

Next

Get Started

### Login

Fields:

Email

Password

Login

Forgot Password

Continue with Google

Create Account

### Signup

Name

Email

Password

Confirm Password

Create Account

Authentication can initially use mock/local logic.

Do not build the real backend yet.

## Acceptance Criteria

User can:

- Complete onboarding
- Skip onboarding
- Navigate to login
- Navigate to signup
- Submit login
- Submit signup
- Navigate into the application

Handle validation and errors properly.

STOP AFTER THIS PHASE.

---

# PHASE 03 — HOME DASHBOARD

## Objective

Build the main dashboard.

Header:

Good morning, Abdullah

Subtitle:

Keep your purchases protected.

Notification icon.

## Summary

Show:

Products

Active Warranties

Expiring Soon

Return Deadlines

## Expiring Soon

Example:

Samsung Galaxy A55

Warranty expires in 18 days

Status:

Active

## Recent Purchases

Show:

Product

Price

Purchase date

Warranty

## Dashboard Requirements

The dashboard must be data-driven.

Do not hardcode separate UI for every product.

Use reusable components and mock data.

## Acceptance Criteria

Dashboard displays correctly with realistic data.

Cards work.

Product cards navigate to product details.

View All navigates to Products.

STOP AFTER THIS PHASE.

---

# PHASE 04 — PRODUCT MANAGEMENT

## Objective

Implement product CRUD.

Create:

Products screen

Add Product screen

Edit Product screen

Product Details screen

## Add Product Fields

Product name

Brand

Model

Category

Purchase date

Purchase price

Store

Return period

Return deadline

Warranty duration

Warranty expiry

Notes

Receipt

## Product Details

Show:

Product information

Purchase information

Return information

Warranty information

Receipt

Actions:

Edit

Delete

## Product Status

Calculate status dynamically.

Examples:

Active

Expiring Soon

Expired

Return Period Active

Return Period Expired

## Acceptance Criteria

User can:

- Add product
- View product
- Edit product
- Delete product
- Search products
- Filter products
- See dynamically calculated status

STOP AFTER THIS PHASE.

---

# PHASE 05 — RECEIPTS & DOCUMENT STORAGE

## Objective

Add receipt management.

Users should be able to:

- Take a receipt photo
- Select receipt from gallery
- View receipt
- Replace receipt
- Delete receipt

The UI should be designed so cloud storage can later replace local storage.

## Receipt UI

Product Details:

Receipt

View Receipt

Replace Receipt

Delete Receipt

Create a clean receipt preview experience.

Support image receipts first.

Keep architecture extensible for PDF receipts later.

## Acceptance Criteria

User can attach a receipt to a product.

Receipt persists according to the current storage implementation.

Receipt can be viewed and removed.

STOP AFTER THIS PHASE.

---

# PHASE 06 — REMINDERS

## Objective

Create a complete reminder system.

Reminders should be automatically generated from:

Return deadline

Warranty expiry

## Reminder Categories

Today

This Week

Later

Completed

## Examples

Return period ends tomorrow

Samsung Galaxy A55

Warranty expires in 18 days

Dell Laptop

Warranty active

AirPods Pro

## Reminder Rules

Allow configurable reminder timing later.

Initially support:

7 days before

3 days before

1 day before

On deadline

## Acceptance Criteria

Reminder list is automatically generated from product data.

Expired reminders are clearly identified.

Users can dismiss/complete reminders.

STOP AFTER THIS PHASE.

---

# PHASE 07 — PUSH NOTIFICATIONS

## Objective

Connect reminders to actual mobile notifications.

Use Expo Notifications.

Notifications should include:

Product name

Event

Remaining time

Example:

"Samsung Galaxy A55 return period ends tomorrow."

Another:

"Dell Laptop warranty expires in 7 days."

## Requirements

Ask for notification permission appropriately.

Do not spam users.

Allow notification preferences in Profile.

## Acceptance Criteria

Notifications can be scheduled.

Notification settings can be changed.

Notification content is meaningful.

STOP AFTER THIS PHASE.

---

# PHASE 08 — PROFILE & SETTINGS

## Objective

Build the complete Profile section.

Show:

Name

Email

Avatar

Settings:

Notifications

Reminder Preferences

Currency

Privacy

Help & Support

About KeepSafe

Logout

## Reminder Preferences

Allow user to configure:

7 days before

3 days before

1 day before

On deadline

## Acceptance Criteria

Settings UI works.

Preferences persist using the current storage approach.

STOP AFTER THIS PHASE.

---

# PHASE 09 — LOCAL DATA PERSISTENCE

## Objective

Replace temporary in-memory mock state with proper local persistence.

The application should retain data after closing/reopening the app.

Persist:

- User
- Products
- Receipts metadata
- Reminders
- Settings

Choose an appropriate local persistence solution compatible with Expo.

Do not introduce a remote backend yet.

## Acceptance Criteria

Close and reopen app.

Previously created products still exist.

Settings remain.

Receipts remain accessible.

STOP AFTER THIS PHASE.

---

# PHASE 10 — AI RECEIPT SCANNER

## Objective

Add the application's major differentiating feature.

User takes a photo of a receipt.

AI/OCR extracts:

Product name

Brand

Model

Price

Purchase date

Store

Warranty information if available

Return information if available

## Flow

```text
Take Receipt Photo
        ↓
OCR / AI Processing
        ↓
Extract Information
        ↓
Show Review Screen
        ↓
User Confirms / Edits
        ↓
Add Product
```

IMPORTANT:

Never automatically save extracted information without allowing the user to review it.

AI extraction may be incorrect.

The user must remain in control.

## UI

Button:

Scan Receipt with AI

Status:

Processing receipt...

Then:

Review Information

Allow editing before saving.

If extraction fails:

"Couldn't read this receipt. You can enter the details manually."

## Acceptance Criteria

Receipt scanner integrates cleanly with Add Product.

Extracted fields can be edited.

Manual entry remains available.

STOP AFTER THIS PHASE.

---

# PHASE 11 — BACKEND

## Objective

Introduce the real backend.

Technology:

Node.js

NestJS

TypeScript

PostgreSQL

Create API architecture.

Backend responsibilities:

Authentication

Users

Products

Receipts

Reminders

Settings

## API Direction

Example:

POST /auth/register

POST /auth/login

GET /products

POST /products

GET /products/:id

PATCH /products/:id

DELETE /products/:id

GET /reminders

PATCH /reminders/:id

## Database

Create PostgreSQL schemas/tables for:

users

products

receipts

reminders

settings

Use proper relationships and indexes.

## Security

Implement:

Password hashing

JWT or secure session strategy

Input validation

Authorization

Rate limiting where appropriate

Do not expose secrets in the mobile application.

## Acceptance Criteria

Mobile application can retrieve and modify real data through the backend.

STOP AFTER THIS PHASE.

---

# PHASE 12 — CLOUD RECEIPT STORAGE

## Objective

Move receipt files from local-only storage to secure cloud storage.

Requirements:

- Secure uploads
- Unique filenames
- User ownership
- Access control
- Delete support
- Image optimization where appropriate

Never expose private receipt files publicly unless intentionally designed.

## Acceptance Criteria

Users can upload, view and delete receipts from the cloud.

Users cannot access another user's receipts.

STOP AFTER THIS PHASE.

---

# PHASE 13 — SECURITY & PRIVACY

## Objective

Perform a complete security review.

Check:

Authentication

Authorization

API validation

File uploads

Receipt privacy

Sensitive data

Tokens

Secrets

Logging

Error messages

Database access

Rate limiting

## Important

Do not store secrets in source code.

Do not expose API keys unnecessarily.

Do not expose private receipt URLs.

Do not trust client-side authorization.

Backend must enforce authorization.

## Acceptance Criteria

No obvious security vulnerabilities remain.

STOP AFTER THIS PHASE.

---

# PHASE 14 — PERFORMANCE & UX POLISH

## Objective

Make the application production quality.

Improve:

Startup time

Navigation

List rendering

Image loading

Animations

Keyboard behavior

Loading states

Error states

Empty states

Accessibility

Touch targets

Offline behavior where appropriate

## UX Review

Check every screen on:

Small phone

Medium phone

Large phone

Dark mode only if explicitly implemented later.

Do not add unnecessary features.

STOP AFTER THIS PHASE.

---

# PHASE 15 — TESTING

## Objective

Test the entire application.

Test:

Authentication

Onboarding

Adding products

Editing products

Deleting products

Search

Filters

Receipts

Reminders

Notifications

AI extraction

Backend APIs

Authentication security

Cloud storage

Settings

Logout

## Test edge cases

No products

Expired warranty

Warranty ending today

Return deadline today

Missing receipt

Invalid date

Invalid price

Large receipt image

Poor-quality receipt

Network failure

Unauthorized API request

Duplicate products

## Acceptance Criteria

No critical crashes.

No broken navigation.

No obvious UI overflow.

No major data-loss bugs.

STOP AFTER THIS PHASE.

---

# PHASE 16 — PRODUCTION BUILD & RELEASE

## Objective

Prepare KeepSafe for release.

Create:

Android production build

App icon

Splash screen

App name

Package identifier

Versioning

Production environment configuration

Privacy policy placeholder

Terms placeholder

Store listing assets

## Android

Prepare:

APK/AAB

Production configuration

Permissions review

Notification configuration

## Final QA

Install fresh application.

Test complete first-time user journey.

Test returning user.

Test offline/poor network scenarios where applicable.

Test notifications.

Test receipt storage.

Test product lifecycle.

STOP AFTER THIS PHASE.

---

# FUTURE FEATURES

Do NOT implement these unless explicitly requested.

Potential future features:

- Family/shared accounts
- Household purchase management
- Warranty claim tracking
- Service center information
- Product resale information
- Price history
- Invoice PDF generation
- Automatic email receipt import
- WhatsApp receipt import
- Advanced AI receipt understanding
- Product manuals
- Serial number tracking
- Barcode scanning
- Multi-country currency support
- Subscription/business features
- Analytics

These are future ideas, not MVP requirements.

---

# CRITICAL PRODUCT RULES

## Rule 1

Do not turn KeepSafe into an e-commerce application.

It is a personal purchase-management application.

## Rule 2

Do not require stores or manufacturers to participate.

The core application must work independently.

## Rule 3

Do not make AI mandatory.

Manual entry must always work.

## Rule 4

Do not automatically trust AI-extracted information.

Always provide a review step.

## Rule 5

Do not overcomplicate the MVP.

Build the smallest useful product first.

## Rule 6

Never sacrifice UX for technical complexity.

## Rule 7

Never rewrite working functionality unnecessarily.

## Rule 8

Never skip testing after a phase.

---

# DEFINITION OF DONE

A phase is complete only when:

- Feature is implemented
- UI is polished
- Navigation works
- TypeScript has no relevant errors
- No obvious runtime errors
- Existing functionality still works
- Edge cases are handled where relevant
- Code is reusable
- No unnecessary duplication exists

---

# ANTIGRAVITY WORKFLOW

When instructed:

"Start Phase X"

Do exactly the following:

1. Read this specification.
2. Inspect the current project.
3. Determine what previous phases already implemented.
4. Do not duplicate existing work.
5. Implement only Phase X.
6. Run/test the application.
7. Fix errors.
8. Check regressions.
9. Summarize what was changed.
10. Clearly state whether Phase X is complete.
11. STOP.

Do not automatically start the next phase.

---

# CURRENT DEVELOPMENT RULE

At the beginning of every session, first inspect the existing project before modifying anything.

Never assume the project is empty.

Never delete working code without a clear reason.

Never install a library when existing project functionality can accomplish the same thing.

If a technical decision is uncertain, choose the simplest maintainable solution that fits the current architecture.

The ultimate goal is:

> Build KeepSafe as a polished, trustworthy, scalable mobile application that solves a real everyday problem without depending on third-party businesses.