# CA Connect - Production Chartered Accountant Client Management Platform

CA Connect is a secure, high-performance client portal and management application built for Chartered Accountant (CA) firms to streamline client communications, document requests, GST invoicing, appointment scheduling, and task tracking.

## 🚀 Key Features

* **Multi-Role Workspace**: Separate customized views and permission sets for CA Administrators and Clients.
* **GST Billing & Invoice PDFs**: Automatic Indian GST (CGST/SGST/IGST) calculations and professional PDF download generation on the backend.
* **Document requests**: Secure file uploads with status pipelines (Requested, Uploaded, Reviewed, Approved, Rejected).
* **Real-time Chat**: Fully integrated chat powered by Socket.IO with typing indicators and read receipts.
* **Compliance Calendar**: Active reminders and preloaded Indian tax filing deadlines (GSTR-1, GSTR-3B, ITR deadlines).
* **Push Notifications**: Live in-app notifications and background alerts.

---

## 📁 Repository Structure

```
├── backend/                  # Express.js Server
│   ├── prisma/               # Prisma Database Schemas & Seed data
│   ├── src/
│   │   ├── controllers/      # Handlers for REST Endpoints
│   │   ├── middleware/       # Auth (JWT verification), uploads, and rate limits
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Socket.io, Email, and PDF services
│   │   └── utils/            # Prisma, JWT & S3 configs
│   └── tests/                # Jest integration tests
│
└── mobile/                   # React Native Expo App
    ├── app/                  # File-based navigation screens (auth, admin, client)
    ├── components/           # Common buttons, inputs, headers, badges
    ├── constants/            # Styling theme tokens (fonts, spacing, colors)
    ├── hooks/                # TanStack query and mutation hooks
    └── services/             # Axios API services and Socket connections
```

---

## 🛠️ Setup & Installation

### Prerequisite Services
- Node.js (v20+)
- PostgreSQL Database
- Expo CLI

### 1. Database Setup
Ensure PostgreSQL is active locally.
1. Access PostgreSQL command line and create the database:
   ```sql
   CREATE DATABASE caconnect;
   ```
2. Configure `.env` in `backend/`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/caconnect?schema=public"
   PORT=3000
   NODE_ENV=development
   JWT_ACCESS_SECRET="your-access-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"
   ADMIN_EMAIL="admin@caconnect.in"
   ADMIN_DEFAULT_PASSWORD="Admin@123"
   ```

### 2. Backend Initialization
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Push the database schema and seed default client/admin records:
   ```bash
   npx prisma db push
   npm run prisma:seed
   ```
4. Start the development API server:
   ```bash
   npm run dev
   ```

### 3. Mobile Setup
1. Navigate to the `mobile` folder:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start -c
   ```

---

## 🧪 Running Tests
Execute the Jest integration suite from the `backend/` directory:
```bash
npm run test
```

---

## 🐳 Docker Deployment

To launch the entire platform (PostgreSQL and Express API Server) inside Docker:
```bash
cd backend
docker-compose up --build -d
```
The health check will monitor status at `http://localhost:3000/health`.

---

## 📝 API Endpoints Documentation

### Auth Module
- `POST /api/auth/login` - Validate credentials and receive JWT access/refresh tokens.
- `POST /api/auth/refresh-token` - Renew expired access tokens.
- `POST /api/auth/forgot-password` - Request email reset link.
- `POST /api/auth/reset-password` - Verify token and submit new password.

### Clients Module
- `GET /api/clients` - List all clients (Admin only).
- `POST /api/clients` - Create a client profile.
- `DELETE /api/clients/:id` - Remove a client profile.

### Invoices Module
- `POST /api/invoices` - Generate a new GST invoice.
- `GET /api/invoices/:id/pdf` - Generate and download the professional PDF invoice (supports authenticating via `?token=...`).
- `PUT /api/invoices/:id/mark-paid` - Confirm receipt of payment.

### Documents Module
- `POST /api/documents/:id/upload` - Upload file attachment to document request.
- `PUT /api/documents/:id/approve` - Mark uploaded document as approved.
