<div align="center">

# 🛡️ ClaimVault
### Smart Purchase, Warranty & Digital Receipt Vault
**Never lose track of what you bought. Guard your return windows, secure manufacturer warranties, and preserve digital receipts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable%20%26%20Offline-0F8B8D.svg?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Tests](https://img.shields.io/badge/Tests-34%2F34%20Passing-emerald.svg)](https://github.com/AbdulahBuilds/ClaimVault-)

[**Live Demo**](https://github.com/AbdulahBuilds/ClaimVault-) • [**Features**](#-key-features) • [**PWA Mobile Install**](#-pwa-mobile-installation) • [**Architecture**](#-architecture--tech-stack) • [**Deployment**](#-deployment-guide)

---

</div>

## 📌 Problem & Vision

Every year, consumers lose thousands of dollars because:
1. **Physical paper receipts fade or get misplaced** before warranty service is requested.
2. **Short return policy windows (7–14 days) lapse quietly** without notification.
3. **Retailers and warranty centers reject legitimate claims** due to lack of invoice date, serial number, or store proof.

**ClaimVault** is a modern, privacy-first mobile web application and Progressive Web App (PWA) designed to solve this completely. It acts as your personal financial and warranty vault—automating deadline calculations, managing digital proofs, and alerting you before your consumer rights expire.

---

## ✨ Key Features

### 📸 1. AI Receipt Scanner & OCR Autofill
- Point your device camera or upload an image/PDF of any shopping receipt.
- Automatically extracts **Product Name**, **Brand**, **Category**, **Price**, **Purchase Date**, and **Store Details**.
- Review and fine-tune extracted data before saving directly into your vault.

### ⏳ 2. Dynamic Return Deadline Countdown Engine
- Live day-by-day countdown visualizers for store return and replacement periods.
- Color-coded urgency status levels:
  - 🟢 **Safe** (> 30 days remaining)
  - 🟡 **Expiring Soon** (≤ 30 days / immediate warning)
  - 🔴 **Expired** (Return window closed)

### 🛡️ 3. Warranty Tracking & Claim Proof Generator
- Tracks 1-Year, 2-Year, 3-Year, 5-Year, and 10-Year (e.g. Inverter/Compressor) coverage.
- One-tap access to invoice numbers, serial tags, proof images, and store contact info when filing claims with official service centers.

### 📱 4. Progressive Web App (PWA) & Offline Mode
- Service Worker caching (`/sw.js`) guarantees instant startup and offline record browsing.
- Installable on iOS (Safari *Add to Home Screen*) and Android (Chrome *Install App*) with standalone full-screen mobile UX.

### 🔔 5. Smart Notification & Alert System
- Multi-tier lead time scheduling (30 days, 14 days, 7 days, 3 days, 1 day before, and final day).
- Web Push & in-app interactive notification banners.
- Customizable alert preferences and quiet hours.

### 🔐 6. Privacy & Security Vault
- **Local-First Architecture**: Receipts and metadata are encrypted and stored locally on your device.
- **Panic Zeroize Feature**: Cryptographic DoD-standard overwrite & instant wipe of sensitive vault data.
- **Export / Import**: 100% data ownership with full JSON backup exports and restoration.
- **Cloud S3 Object Storage**: Optional encrypted cloud sync with 15-minute temporary signed URLs.

---

## 🏗️ Architecture & Tech Stack

```
ClaimVault/
├── src/
│   ├── components/         # Atomic UI, Nav, Modals, Feed Cards
│   │   ├── modals/         # Scanner, Receipt Viewer, Privacy, Support, etc.
│   │   ├── navigation/     # Mobile Bottom Nav & Header Bars
│   │   └── ui/             # Button, InputField, Toast, Badges
│   ├── context/            # React Context (ProductContext, ToastContext)
│   ├── screens/            # Home, Products, Add, Profile Screens
│   ├── services/           # Storage, Auth, Sync, Notifications, Cloud API
│   ├── constants/          # Theme tokens, Categories, Release config
│   └── utils/              # Date calculations, Haptics, Formatting
├── server/                 # REST Backend API & S3 Storage Microservice
│   ├── src/                # TypeScript Node.js server with HMAC & JWT security
│   ├── runner.mjs          # Backend live runner & automated test suite
│   └── phase15_test_runner.mjs # 34-Test comprehensive edge case suite
└── public/                 # PWA Web Manifest, Icons, and Service Worker
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18 (TypeScript), Vite 5 |
| **Styling & Animations** | TailwindCSS 3.4, Framer Motion, Lucide Icons |
| **PWA & Offline** | Service Worker, Web App Manifest, Cache API |
| **State & Persistence** | React Context + LocalStorage Vault with S3 Sync |
| **Backend API** | Node.js REST API with JWT Auth & Sliding-Window Rate Limiting |
| **Security** | AES-256 Cloud Object Vault, XSS Input Sanitization, HMAC Signed URLs |

---

## 📲 PWA Mobile Installation

ClaimVault is optimized to behave like a native iOS and Android application without requiring App Store downloads.

### 🍏 On iPhone / iPad (iOS Safari)
1. Open the deployed ClaimVault URL in **Safari**.
2. Tap the **Share** button (box with an upward arrow) at the bottom.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top-right corner.
5. Launch **ClaimVault** from your Home Screen in full-screen app mode.

### 🤖 On Android (Google Chrome)
1. Open the ClaimVault URL in **Chrome**.
2. Tap the three dots menu **(⋮)** or the popup banner at the bottom.
3. Tap **"Install App"** or **"Add to Home screen"**.
4. ClaimVault will install to your app drawer and home screen.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/AbdulahBuilds/ClaimVault-.git
cd ClaimVault-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` or your local Wi-Fi IP address on your mobile device.

### 4. (Optional) Run the Backend REST & Storage API
```bash
node server/runner.mjs
```
The backend will launch on `http://localhost:5000` with the health endpoint active at `http://localhost:5000/api/health`.

---

## 🧪 Testing & Verification

ClaimVault includes a 34-test comprehensive edge cases and integration test suite:

```bash
# Validate TypeScript compilation and production bundle
npm run build

# Run the 34-test comprehensive edge cases suite
node server/phase15_test_runner.mjs
```

**Test Coverage Highlights**:
- ✅ Date boundary edge cases (0-day same-day, 1-day, expired yesterday, multi-year warranties)
- ✅ Currency formatters & Pakistani Rupee (PKR) edge cases
- ✅ Schema validation & corrupted backup file recovery
- ✅ Multi-tenant user isolation (403/404 cross-tenant guards)
- ✅ XSS sanitization and script payload neutralization
- ✅ 15-minute temporary HMAC signed URL generation

---

## 🌐 Deployment Guide

### Deploying to Vercel (Recommended)
ClaimVault includes a ready-to-use [`vercel.json`](./vercel.json) configured with SPA rewrites and security headers.

1. Install Vercel CLI or link with GitHub:
```bash
npm install -g vercel
vercel
```
2. For production deployment:
```bash
vercel --prod
```

### Deploying to Netlify / GitHub Pages
Build the production-ready static assets in `/dist`:
```bash
npm run build
```
Deploy the generated `dist/` directory to your static hosting provider of choice.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/AbdulahBuilds">Abdullah</a> • Securing Consumer Purchases & Warranties</sub>
</div>
