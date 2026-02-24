# Helpdesk Backend API

A robust, RESTful backend system for a company helpdesk, built with Node.js, Express, and MySQL. It enables employees to raise support tickets, support staff to manage assigned tickets through their lifecycle, and managers to oversee the entire system.

## 🌟 Key Features
- **Role-Based Access Control (RBAC)**: Distinct permissions for `MANAGER`, `SUPPORT`, and `USER` (Employee) roles enforced via JWT Middleware.
- **Secure Authentication**: Uses `bcryptjs` for password hashing and JSON Web Tokens (JWT) for secure authentication.
- **Ticket Lifecycle Management**: Enforces strict state transitions (`OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`).
- **Audit Logging**: Automatically tracks the history of ticket status changes in the database.
- **Interactive Documentation**: Fully documented using Swagger UI for easy exploration and testing.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- MySQL Server (v8+ recommended)

### 1. Database Initialization
1. Log into your MySQL server as a privileged user (e.g., `root`).
2. Run the provided SQL script to construct the `helpdesk_db` database, its tables, and seed the default user accounts:
   ```bash
   mysql -u root -p < database_schema.sql
   ```

### 2. Environment Configuration
Create a `.env` file in the root directory (`f:/backend`) and configure the following variables:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=helpdesk_db
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Installation
Navigate to the project directory and install all required Node dependencies:
```bash
npm install
```

### 4. Running the Server
Start the development server with live-reloading:
```bash
npm run dev
```
*(Or start it normally for production: `node index.js`)*

The server will be live at `http://localhost:3000`.

---

## 🔑 Default User Accounts

When you initialized the database using `database_schema.sql`, three default accounts were automatically generated so you can test the RBAC rules immediately.

- **Manager**: `manager@test.com` (Password: `password123`)
- **Support**: `support@test.com` (Password: `password123`)
- **Employee**: `user@test.com` (Password: `password123`)

---

## 📚 API Endpoints Overview
The system exposes 12 highly-secured endpoints across four distinct application domains.

### Authentication & Users
- `POST /auth/login`: Authenticate and receive a JWT.
- `POST /users`: Create new users (Managers only).
- `GET /users`: List system users (Managers only).

### Tickets
- `POST /tickets`: Submit a new ticket (Employees only).
- `GET /tickets`: View tickets (Managers see all, Support see assigned, Employees see their own).
- `PATCH /tickets/:id/assign`: Assign tickets to Support staff (Managers only).
- `PATCH /tickets/:id/status`: Update ticket lifecycle state.
- `DELETE /tickets/:id`: Delete a ticket and cascade delete associated comments/logs (Managers only).

### Comments
- `POST /tickets/:id/comments`: Add a comment to an accessible ticket.
- `GET /tickets/:id/comments`: Retrieve comments for an accessible ticket.
- `PATCH /comments/:id`: Edit a comment (Author or Manager only).
- `DELETE /comments/:id`: Delete a comment (Author or Manager only).

---

## 📘 Interactive API Documentation
Once the server is running, navigate to the following URL in your browser to interact safely with the API using the built-in Swagger UI interface:

**[http://localhost:3000/docs](http://localhost:3000/docs)**
