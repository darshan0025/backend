# Helpdesk Backend API

A RESTful backend for a company helpdesk system where employees can raise support tickets, support staff handle them, and managers track the overall system.

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL Server running

### 1. Database Initialization
1. Log into your MySQL server as a privileged user (e.g., `root`).
2. Run the provided SQL script to create the database schema:
   ```bash
   mysql -u root -p < database_schema.sql
   ```
   *This script creates the `helpdesk_db` database, the necessary tables, and inserts a default manager user.*

### 2. Environment Configuration
1. Rename or copy `.env.example` to `.env` (or just create a `.env` file).
2. Configure the variables:
   ```env
   PORT=3000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=helpdesk_db
   JWT_SECRET=your_super_secret_jwt_key
   ```

### 3. Installation
1. Navigate to the `backend` folder:
   ```bash
   cd f:/backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### 4. Running the Server
Start the development server with `nodemon`:
```bash
npx nodemon index.js
```
Or start it normally:
```bash
node index.js
```

The server should be running at `http://localhost:3000`.

## API Documentation (Swagger)
The API includes integrated Swagger UI documentation. Once the server is running, you can explore and test all endpoints directly from your browser by navigating to:
**[http://localhost:3000/docs](http://localhost:3000/docs)**

## Default Users
The database initialization script (`database_schema.sql`) creates a default MANAGER user that can be used to set up other users via the API.
- **Email**: manager@test.com
- **Password**: password123

## Authentication & Authorization
- The API uses JSON Web Tokens (JWT) for authentication.
- After logging in (`POST /auth/login`), you will receive a token.
- For protected endpoints, include this token in the header:
  `Authorization: Bearer <your_jwt_token_here>`

## Extensiblity Note
- Due to lack of provided credentials, automatic database initialization on application startup was disabled. Execute `database_schema.sql` manually.
