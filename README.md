# Nexus CRM — Frontend

A modern, animated **CRM dashboard** built with React, Vite, Tailwind CSS, and Framer Motion. It is the frontend for a FastAPI CRM backend and covers authentication, role-based access control, campaign management, user administration, and analytics with live charts.

> Data-dense dashboard UI with a focus on motion, clarity, and a professional, production-grade feel.

---

## ✨ Features

- **Authentication** — JWT-based login & registration with a split-screen, animated brand panel.
- **Role-Based Access Control (RBAC)** — `admin`, `manager`, `employee`, and `client` roles, each with a tailored permission matrix and navigation.
- **Dashboard** — Animated count-up stat cards, a campaign-status donut chart (Recharts), and a recent-activity feed.
- **Campaigns** — Full CRUD with a filterable card grid, status badges, animated create/edit modals, and confirm-to-delete.
- **Analytics** — Performance line charts over time, summary metric cards, per-campaign filtering, and a record-entry form.
- **User Management** *(admin only)* — Searchable table with avatar initials, role badges, and inline edit/remove.
- **Profile** — Inline name editing, account details, and session controls.
- **Polish** — Page transitions, collapsible sidebar, skeleton loading states, glassmorphism, dark-themed toasts, and `prefers-reduced-motion` support.

---

## 🛠 Tech Stack

| Layer | Tooling |
|-------|---------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (custom design tokens) |
| Animation | Framer Motion 11 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| HTTP | Axios (JWT interceptors) |
| Routing | React Router 6 |
| Notifications | react-hot-toast |
| Dates | date-fns |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (developed on Node 24)
- The companion **FastAPI CRM backend** running (default: `http://localhost:8000`)

### Install

```bash
npm install
```

> **Behind a corporate proxy / SSL inspection?** If npm fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, trust your OS certificate store:
> ```bash
> # Node 22+: use the system CA store
> NODE_OPTIONS=--use-system-ca npm install
> ```
> If npm's strict peer resolver complains, add `--legacy-peer-deps`.

### Configure

```bash
cp .env.example .env
# edit VITE_API_URL if your backend isn't on localhost:8000
```

### Run

```bash
npm run dev      # starts Vite on http://localhost:3000
```

The dev server runs on **port 3000** to match the backend's CORS allowlist.

### Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

---

## 📁 Project Structure

```
src/
├── api/            # Axios client + endpoint modules (auth, campaigns, users, analytics)
├── components/
│   ├── ui/         # Button, Input, Modal, Badge, StatCard, Spinner, ProtectedRoute
│   └── layout/     # Sidebar, Header, Layout shell
├── context/        # AuthContext (JWT + RBAC permission matrix)
├── pages/          # Login, Register, Dashboard, Campaigns, Analytics, Users, Profile
├── utils/          # formatters, status/role metadata, avatar helpers
├── App.jsx         # routes (public + protected)
├── main.jsx        # entry: Router + AuthProvider + Toaster
└── index.css       # Tailwind layers + custom components/utilities
```

---

## 🔐 Roles & Permissions

| Capability | Admin | Manager | Employee | Client |
|------------|:-----:|:-------:|:--------:|:------:|
| View campaigns | ✅ | ✅ | ✅ | — |
| Create / edit / delete campaigns | ✅ | ✅ | — | — |
| Analytics | ✅ | ✅ | — | — |
| User management | ✅ | — | — | — |

---

## 📝 Notes

- JWT is stored in `localStorage` under `crm_token`; a 401 response clears it and redirects to login.
- The API base URL is read from `VITE_API_URL` (falls back to `http://localhost:8000`).
- This repository contains the **frontend only**. Point it at the CRM backend to enable login and live data.

---

## 📄 License

MIT — free to use, modify, and share.
