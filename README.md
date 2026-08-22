# ⚡ DAYFLOW — Intelligent HRMS

> **"Every workday, perfectly aligned."**  
> Built for the **Odoo Hackathon 2026**.

Dayflow is a modern, high-performance Human Resource Management System (HRMS) built with Next.js 14, Prisma ORM, and Framer Motion. Beyond core HR functionality (Attendance, Leave approval workflows, Employee directories, and Payroll), Dayflow introduces **Dayflow Pulse & Day Story** — transforming raw attendance and calendar activities into a living, narrated timeline of an employee's workday.

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Architecture & Security
- **HR vs. Employee Portals**: Complete RBAC enforced via server-side guards and secure HttpOnly JWT cookies.
- **Strict Role Boundaries**: Public registrations are locked to `EMPLOYEE` role only. HR accounts are protected and provisioned exclusively via administrator seeds.

### 2. ⚡ Dayflow Pulse (Interactive Workday Timeline)
- **Living Timeline Track**: Dynamic time ruler showing categorized work blocks across the day (9 AM – 5 PM).
- **Category-Specific Micro-Animations**:
  - 🔮 **Deep Work**: Breathing scale animation.
  - 🤝 **Meetings**: Live pulsing border.
  - ⚡ **Admin**: Subtle shimmer.
  - ☕ **Rest**: Calm focus state.
- **Typewriter Day Story**: Automated narrative generation contextualizing the employee's work achievements, meetings, and attendance.

### 3. 🎯 HR Action Center & Management
- **Live Attention Dashboard**: Instant metric summaries (attendance rates, missing checkouts, pending approvals).
- **Leave Management Workflow**: Multi-status filter tabs (Pending, Approved, Rejected) with mandatory reviewer comments for rejections.
- **Employee Directory**: Instant search filter, department tags, and slide-in profile drawer.
- **Payroll Management**: Interactive compensation breakdown with inline updating.

### 4. 💼 Employee Self-Service
- **Attendance & Time Tracking**: One-click Check-in & Check-out with instant status confirmation.
- **Leave Applications**: Balance visualization with animated progress bars and application modal.
- **Payroll Breakdown**: Detailed annual & monthly net salary calculators.
- **Notifications Hub**: Categorized inbox with mark-as-read interactions.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database & ORM**: SQLite + Prisma 5
- **Authentication**: JWT (`jose`) + HttpOnly Cookies + `bcryptjs`
- **Styling**: Tailwind CSS + Custom Dark Glassmorphism Design System
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PravinkumarM003/Odoo-Hackathon-2026.git
   cd Odoo-Hackathon-2026
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file from `.env.example`:
   ```bash
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="dayflow-super-secret-jwt-key-2026-secure"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize Database & Seed Demo Data:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **HR Admin** | `hr@dayflow.demo` | `Demo@123` |
| **Employee** | `employee@dayflow.demo` | `Demo@123` |

---

## 📜 License
Built for Odoo Hackathon 2026.
