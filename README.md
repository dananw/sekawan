# Vehicle Booking System

A full-stack application for managing vehicle bookings, approvals, and maintenance.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

1.  **Node.js (LTS version)**
    - Download and install from [nodejs.org](https://nodejs.org/).
    - Verify installation by running:
      ```bash
      node -v
      npm -v
      ```

2.  **pnpm (Package Manager)**
    - We use `pnpm` for faster and more efficient package management.
    - Enable it via Corepack (included with Node.js):
      ```bash
      corepack enable
      corepack prepare pnpm@latest --activate
      ```
    - Verify installation:
      ```bash
      pnpm -v
      ```

## 🚀 Quick Start

Follow these steps to set up and run the project from scratch.

### 1. Install Dependencies
Install all required libraries and packages for the project.

```bash
pnpm install
```

### 2. Seed the Database
Populate the local database with initial testing data (users, vehicles, etc.).

```bash
pnpm --filter @sekawan/api db:seed
```

### 3. Run the Application
Start both the frontend and backend servers in development mode.

```bash
pnpm dev
```

Once running, you can access the application at:
-   **Web App:** [http://localhost:5173](http://localhost:5173) (Open this in your browser)
-   **API Server:** [http://localhost:3001](http://localhost:3001)
-   **API Documentation:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## 🔑 Testing Credentials

Use these accounts to log in and test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@sekawan.com` | `password123` |
| **Approver L1** | `approver1@sekawan.com` | `password123` |
| **Approver L2** | `approver2@sekawan.com` | `password123` |

## 🛠️ Technology Stack

-   **Frontend:** React, Shadcn UI, TanStack Query, Recharts
-   **Backend:** NestJS, Drizzle ORM, SQLite
-   **Tools:** Turborepo, pnpm
