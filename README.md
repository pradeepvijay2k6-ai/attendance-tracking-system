<div align="center">

# 🎓 Institutional Attendance Tracking System
### Department of Information Technology · SSN College of Engineering

A high-performance, real-time web & mobile application designed for institutional attendance tracking, automated timetable management, faculty period swapping, syllabus logging, and live Google Sheets synchronization.

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Live%20Sync-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)](https://www.google.com/sheets/about/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## ✨ Key Features

### 👨‍🏫 Faculty Portal
- **Sub-Second Attendance Submission:** Mark present/absent students with instant confirmation.
- **Syllabus & Topics Covered Logger:** Log topics taught in each period directly into institutional records.
- **Smart Attendance Visualizer:** Visual attendance status indicators with threshold alerts (≥75% Good, 65–74% Warning, <65% Critical).
- **Period Swapping & Extra Classes:** Request class substitutions with peer faculty and schedule extra slots seamlessly.

### 🛡️ Admin Master Dashboard
- **Teacher ↔ Subject Reassignment:** One-click assignment transfer that automatically updates timetables and section mappings across the entire semester.
- **Master Data Controls:** Complete management for Students (including Lateral Entry batches), Faculty, Classes, Sections, and Timetable matrices.
- **Department Broadcast Ticker:** Publish instant scrolling ticker announcements across the faculty portal.
- **Live Attendance Logs:** Export detailed attendance session records with topics covered to CSV.

### 📊 Automated Google Sheets Integration
- **Section & Subject-Wise Tabs:** Automatically organizes records into dedicated sheets (e.g. `IT A - UIT3361 - OOP Java`, `IT B - UIT3301 - Database Tech`).
- **Zero Duplicate Roster Indexing:** Multi-key identification prevents duplicate student entries.
- **Dynamic Formula Tracking:** Automatically calculates **Present Count**, **Total Classes**, and **Attendance %** in real-time.
- **Topics & Syllabus Audit Log:** Centralized chronological audit log capturing class date, faculty, and syllabus progression.

### 📱 Cross-Platform Accessibility
- **Progressive Web App (PWA):** Installable on Android, iOS, Windows, and macOS with native app-like performance and offline resilience.

---

## 🏗️ Architecture & Tech Stack

```
├── frontend/                  # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/        # Reusable UI components & Department Ticker
│   │   ├── context/           # Authentication state & Role-Based Access
│   │   ├── pages/             # Faculty, Admin, Student, and Login Dashboards
│   │   └── services/          # Supabase RPC & Google Sheets webhook services
│   └── vercel.json            # Security headers & SPA routing configuration
├── backend/                   # Node.js / Express API services
│   ├── src/
│   │   ├── routes/            # Admin, attendance, timetable, and swap routes
│   │   └── services/          # Server-side Google Sheets dispatchers
│   └── src/db/                # SQL migrations & institutional seed datasets
└── docs/                      # Google Apps Script live sync automation script
```

- **Frontend:** React, React Router, Axios, Lucide Vector Icons, CSS Variables & Glassmorphism.
- **Backend & Database:** Supabase (PostgreSQL), Row Level Security (RLS), Supabase RPC Stored Procedures.
- **Automation:** Google Apps Script Webhook Engine.
- **Security:** HTTP Security Headers (`X-Frame-Options`, `HSTS`, `CSP`, `nosniff`), Brute-force rate limiting, and encrypted environment variable isolation.

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/pradeepvijay2k6-ai/attendance-tracking-system.git
cd attendance-tracking-system/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file inside the `frontend/` directory (or copy from [`.env.example`](file:///Users/pradeep/Documents/GitHub/attendance-tracking-system/frontend/.env.example)):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Admin Authentication
VITE_ADMIN_PASSCODE=your-secret-passkey
VITE_ALLOWED_ADMIN_EMAILS=admin1@ssn.edu.in,admin2@ssn.edu.in

# Google Sheet Live Sync Webhook
VITE_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/your-app-script-id/exec
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Privacy

- **No Secrets in Source:** All sensitive credentials, API keys, and admin passkeys are loaded strictly from environment variables and are excluded from Git via comprehensive `.gitignore` rules.
- **Role-Based Guards:** Multi-factor role verification on client routes and database stored procedures.
- **Clickjacking & XSS Protection:** Enforced via strict security headers in [`vercel.json`](file:///Users/pradeep/Documents/GitHub/attendance-tracking-system/vercel.json).

---

## 🤝 Contributing

Contributions and feature suggestions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m "Add AmazingFeature"`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Developed for the Department of Information Technology · SSN College of Engineering</sub>
</div>
