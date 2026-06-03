SupportSphere AI

AI-Powered Complaint & Ticket Management Platform

SupportSphere AI is a modern full-stack complaint and ticket management platform built using the MERN Stack. The system leverages Artificial Intelligence to automatically categorize complaints, determine priority levels, assist administrators in ticket resolution, and improve operational efficiency.

The platform combines secure authentication mechanisms such as JWT Authentication, Email OTP Verification, Mobile SMS OTP Verification, and WebAuthn Passkeys with AI-powered complaint analysis and enterprise-grade Role-Based Access Control (RBAC).

Project Overview

Organizations often face challenges in managing complaints efficiently due to manual categorization, delayed responses, poor prioritization, and lack of visibility into ticket status.

SupportSphere AI addresses these challenges by:

Automating complaint categorization using AI
Predicting complaint priority levels
Managing complete ticket lifecycles
Supporting secure multi-factor authentication
Providing collaborative complaint resolution
Offering administrative analytics and monitoring

The platform is suitable for:

Educational Institutions
Universities
Government Departments
Customer Support Centers
IT Help Desks
Business Organizations
Features
AI-Powered Complaint Analysis

SupportSphere AI integrates Google Gemini AI to analyze complaint details and automatically:

Categorize complaints
Predict priority levels
Generate complaint summaries
Assist administrators during ticket resolution
Supported Categories
Technical
Academic
Administrative
Security
Hostel
Infrastructure
General
Priority Levels
Low
Medium
High
Urgent
Authentication & Security
User Authentication
User Registration
User Login
JWT Authentication
Protected Routes
Two-Factor Authentication (2FA)
Email OTP Verification
6-digit OTP
Email delivery
Expiration handling
Mobile SMS OTP Verification
Firebase Authentication
Global country code support
SMS verification
Passkey Authentication
WebAuthn Support
Biometric Login
Passwordless Authentication
Device-Based Authentication
Ticket Management
Create Tickets
View Tickets
Update Tickets
Delete Tickets
Ticket Status Tracking
Ticket Assignment
Ticket Resolution
Ticket Closure
Collaboration Features
Add Collaborators
Ticket Comments
Shared Resolution Workflow
Activity Tracking
Notifications
Ticket Update Notifications
Assignment Notifications
Resolution Notifications
Status Change Notifications
Administration
User Management
Role Management
Ticket Monitoring
Analytics Dashboard
Complaint Statistics
Complaint Trends
File Management
Image Uploads
PDF Uploads
Complaint Attachments
Cloud Storage Integration
Role Hierarchy (RBAC)
Level	Role	Description
0	⚡ God Admin	Full system control
1	👑 Super Admin	Complete administrative access
2	🛡️ Admin	User and ticket management
3	⚜️ Support Manager	Support team management
4	⚙️ Support Agent	Ticket resolution
5	🤖 AI Reviewer	AI prediction validation
6	📊 Analytics Manager	Analytics access
7	📁 Organization Manager	Queue management
8	✅ Verified User	Full ticket management
9	🔹 Guest User	Basic ticket access
RBAC Rules
Users can only manage lower-ranked roles.
Users cannot assign their own role or higher.
Administrative actions are privilege restricted.
God Admin bypasses all restrictions.
Skills Demonstrated Through This Project
Programming Languages
Java
Python
JavaScript (ES6+)
C++
Frontend Development
React.js
React Router
Vite
HTML5
CSS3
Tailwind CSS
Framer Motion
Chart.js
Responsive Web Design
Backend Development
Node.js
Express.js
REST API Development
Middleware Development
API Integration
File Upload Management
Database Technologies
MongoDB
MongoDB Atlas
Mongoose
MySQL
SQL
Authentication & Security
JWT Authentication
WebAuthn Passkeys
OTP Authentication
Firebase Authentication
Role-Based Access Control
Password Hashing (bcrypt)
Helmet Security
Rate Limiting
Artificial Intelligence
Google Gemini API
AI Integration
Prompt Engineering
Complaint Categorization
Priority Prediction
Cloud & Deployment
Vercel
Render
Cloudinary
Netlify
MongoDB Atlas
Software Engineering
System Design
Software Architecture
API Design
Database Design
Agile Development
Technical Documentation
Tools & Platforms
Git
GitHub
Postman
Firebase
Linux
VS Code
Nodemailer
Core Computer Science
Data Structures & Algorithms
Object-Oriented Programming
Database Management Systems
Operating Systems
Computer Networks
Technology Stack
Frontend
React 19
Vite
Tailwind CSS
React Router
Axios
Framer Motion
Chart.js
Lucide Icons
Backend
Node.js
Express.js
Mongoose
JWT
bcryptjs
Express Validator
Nodemailer
SimpleWebAuthn
Database
MongoDB Atlas
Authentication
JWT
Email OTP
Firebase SMS OTP
WebAuthn Passkeys
AI
Google Gemini API
Cloud Services
Cloudinary
Render
Vercel
System Architecture
Frontend (React + Vite)
         |
         v
REST APIs (Express.js)
         |
         v
Business Logic Layer
         |
         +------------------------+
         |                        |
         v                        v

MongoDB Atlas             Google Gemini API
         |
         v

Cloudinary Storage
Project Structure
SupportSphere-AI/

├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── public/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   └── uploads/
│
├── docs/
├── README.md
└── package.json
Installation
Clone Repository
git clone https://github.com/Shsrma/SupportSphere-AI.git

cd SupportSphere-AI
Backend Setup
cd server
npm install

Create .env

PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRE=7d

EMAIL_USER=
EMAIL_PASS=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Start backend:

npm run dev
Frontend Setup
cd client
npm install

Create .env

VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=

Start frontend:

npm run dev

Frontend URL:

http://localhost:5173
Authentication Flow
Login
  |
  v
Email + Password
  |
  v
OTP Verification
  |
  v
JWT Issued
  |
  v
Dashboard Access
Passkey Flow
Register Passkey
       |
       v
Biometric Verification
       |
       v
Secure Login
Ticket Workflow
Create Complaint
        |
        v
AI Categorization
        |
        v
Priority Prediction
        |
        v
Assignment
        |
        v
Investigation
        |
        v
Resolution
        |
        v
Closed
API Overview
Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
OTP
POST /api/auth/send-otp
POST /api/auth/verify-otp
Passkeys
POST /api/passkeys/register/options
POST /api/passkeys/register/verify

POST /api/passkeys/login/options
POST /api/passkeys/login/verify
Tickets
GET /api/tickets
POST /api/tickets
GET /api/tickets/:id
PUT /api/tickets/:id
DELETE /api/tickets/:id
Notifications
GET /api/notifications
PUT /api/notifications/:id/read
Security Features
JWT Authentication
WebAuthn Passkeys
OTP Verification
Firebase Authentication
Role-Based Access Control
Password Hashing (bcrypt)
Helmet Security
Rate Limiting
Input Validation
Protected Routes
Documentation

The project includes:

Product Requirements Document (PRD)
Technical Requirements Document (TRD)
UI/UX Brief
App Flow Document
Software Architecture Document (SAD)
ER Diagram
API Specification
Security Design Document
DevOps / CI-CD Document
Monitoring & Logging Document
Test Plan & Test Cases
User Acceptance Testing (UAT)
Product Roadmap
Future Roadmap
Real-Time Notifications
AI Chat Assistant
Smart Ticket Routing
OCR Complaint Analysis
Voice Complaint Submission
Mobile Application
Enterprise Multi-Tenant Support
Predictive Analytics
SLA Monitoring
Contributing
Fork the repository
Create a feature branch
git checkout -b feature/new-feature
Commit your changes
git commit -m "Add new feature"
Push changes
git push origin feature/new-feature
Open a Pull Request
Author
Ankur Sharma

B.Tech Computer Science & Engineering

Skills:

Full Stack Development
MERN Stack Development
Artificial Intelligence
Machine Learning
Cloud Technologies
Cybersecurity
Software Engineering

GitHub:
https://github.com/Shsrma

LinkedIn:
https://linkedin.com/in/ankur-s-52686427b

Portfolio:
https://ankursharma-20.netlify.app

License

© 2026 SupportSphere AI

All Rights Reserved.

Support

If you find a bug, have a feature request, or would like to contribute, please open an issue in the repository.

⭐ If you found this project useful, consider starring the repository.
