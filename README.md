# SupportSphere AI - Compliant Management System

SupportSphere AI is an intelligent complain and ticket management application designed to organize, triage, and resolve complaints efficiently with AI automated classification and a security-first architecture.

## Purpose

SupportSphere AI automates the workflow of raising and managing service complaints.
* **AI-Powered Categorization:** Integrates with Gemini AI to analyze the complaint title and description, automatically classifying it into a category (Technical, Academic, Hostel, Security, Administrative, etc.) and determining the priority level (Low, Medium, High, Urgent).
* **Granular Role Hierarchy (RBAC):** Restricts data access and user actions based on privilege levels.
* **Multi-Factor Authentication (2FA):** Secures credentials login with an Email OTP challenge and a Mobile SMS OTP secondary fallback option.
* **Passkey / Biometric Auth:** Native WebAuthn passkey registration and login support.
* **Collaboration:** Creators can add other users as collaborators to their tickets to help resolve the issue.

---

## Technical Stack

* **Frontend:** React, Vite, Framer Motion (Glassmorphic dark UI), Lucide Icons, Chart.js.
* **Backend:** Node.js, Express, Mongoose, Nodemailer, SimpleWebAuthn.
* **Database:** MongoDB (Local).
* **Identity & SMS Gateway:** Firebase Web SDK (Google, GitHub, Microsoft popups & Mobile OTP SMS delivery).

---

## Setup & Running Guide

### Prerequisites
* **Node.js** (v18+ recommended)
* **MongoDB** running locally on port `27017`.
* **Firebase Web Project** config properties.

### 1. Server Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the configurations:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/support_sphere
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key
   
   # For NodeMailer (Local testing uses console logging simulation)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```
4. Run the backend development server:
   ```bash
   npm run dev
   ```

### 2. Client Setup
1. Open a terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. The Firebase SDK initialization configuration is defined in `client/src/firebase.js`. Verify your config properties match your Firebase console.
4. Run the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## User Guide & Role Privilege Matrix

The system enforces strict role-based controls. Ranks are ordered as follows:

| Symbol | Role Name | Hierarchy Level | Capabilities & Access Boundaries |
| :--- | :--- | :--- | :--- |
| `⚡` | `god_admin` | 0 (Highest) | Super-user. Bypasses all RBAC rules. Can view and modify all users and roles, including other admins. Cannot be demoted or deleted. |
| `👑` | `super_admin` | 1 | Full system admin. Can view and manage staff/users strictly below their rank. Cannot modify/assign equal or higher roles. |
| `🛡️` | `admin` | 2 | System admin. Can view and manage staff/users strictly below their rank. |
| `⚜️` | `support_manager` | 3 | Manage support agents, assign tickets, and resolve tickets. |
| `⚙` | `support_agent` | 4 | Triage, assign, comment, and resolve tickets. |
| `🤖` | `ai_reviewer` | 5 | Review AI predictions and adjust complaint priorities. |
| `📊` | `analytics_manager`| 6 | View analytics reports and export dashboard metrics. |
| `📁` | `organization_manager`|7 | Manage organizational ticketing queues. |
| `📁` | `verified_user` | 8 | Raise complaints, attach files (images/PDFs), add collaborators, and resolve/close their own tickets. |
| `🔹` | `guest_user` | 9 (Lowest) | Raise complaints and view/resolve their own tickets with limited actions. |

### Role Hierarchy Rules
* **Viewing Boundary:** Users in Settings can only see users of equal or lesser rank (higher rank indices). Users above them are filtered out.
* **Modification Boundary:** An administrator can only modify/change roles of users strictly below them in privilege (e.g. `🛡️ admin` cannot demote `👑 super_admin`).
* **Promotion Boundary:** An administrator cannot promote any user to their own rank or higher (e.g. `🛡️ admin` can only promote a user to `⚜️ support_manager` or lower).
* **Bypass:** The `⚡ god_admin` can manage anyone and assign any role.

---

## Feature Details

### Two-Factor Authentication (2FA)
When logging in with email and password:
1. **Primary (Email OTP):** The server generates a 6-digit OTP code valid for 50 seconds. It is sent to your email (and logged directly in the backend terminal console for development).
2. **Secondary (Mobile SMS OTP Fallback):** If you have a phone number registered, a button is shown: `"Verify via Mobile SMS instead"`. Clicking it sends a Firebase SMS OTP code using an invisible reCAPTCHA challenge. Enter the SMS code to complete authentication.

### Global Country Code Selector
All phone fields in the Register and Login screens feature a country code drop-down menu containing global country codes (e.g., `+91` India, `+1` US, `+44` UK). Selecting your country code and typing your number ensures SMS delivery works globally.

### User Ticket Resolution
Standard users can raise complaints. Standard users (creators/collaborators of the ticket) can change their own ticket's status to **Resolved** or **Closed** via the dropdown inside the ticket detail view. Re-opening a closed ticket or editing assignment status is restricted to support agents and admins.

---

## Copyright Attribution

© 2026 SupportSphere AI. All rights reserved.
Developed and managed by **Ankur Sharma**.
