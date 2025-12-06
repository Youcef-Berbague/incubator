# Badji Mokhtar University Innovation Incubator

A modern, full-stack web application for managing university innovation incubator operations at Badji Mokhtar University, Annaba, Algeria.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Security Features](#security-features)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The Badji Mokhtar University Innovation Incubator platform is designed to streamline the management of student entrepreneurship projects, provide mentorship opportunities, and facilitate the journey from idea to successful startup. The platform connects students, supervisors, and administrators in a collaborative environment.

### Key Objectives

- **Project Management**: Register and track innovation projects
- **User Management**: Handle multiple user roles (students, supervisors, admins)
- **AI Assistant**: Integrated chatbot for real-time assistance
- **Faculty Integration**: Connect projects with academic departments
- **Jury System**: Manage project evaluations and jury members

---

## ✨ Features

### For Students

- Project registration with team members
- Progress tracking and status updates
- AI-powered assistance
- Document management
- Communication with supervisors

### For Supervisors

- Monitor assigned projects
- Provide guidance and feedback
- Track student progress
- Collaborate with jury members

### For Administrators

- Complete dashboard with analytics
- User management (CRUD operations)
- Project oversight
- Faculty and department management
- Jury member assignment
- System configuration

### General Features

- **Multi-role Authentication**: JWT-based secure authentication
- **Real-time AI Chat**: Markdown-supported chatbot with session memory
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Security**: Rate limiting, CORS, helmet protection, input sanitization
- **Email Notifications**: Automated notifications for important events
- **Data Validation**: Comprehensive input validation on both client and server

---

## 🛠 Technology Stack

### Frontend

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router
- **State Management**: Pinia
- **Styling**: Scoped CSS with custom design system
- **HTTP Client**: Axios
- **Markdown**: Marked.js
- **Security**: DOMPurify for XSS protection

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (Access & Refresh Tokens)
- **Security**:
  - Helmet.js (HTTP headers)
  - CORS
  - Express Rate Limit
  - Cookie Parser
  - Compression
- **Logging**: Custom file-based logging system
- **Notifications**: Nodemailer for email

### Development Tools

- **Package Manager**: npm
- **API Testing**: Built-in REST endpoints
- **Code Quality**: ESLint compatible
- **Version Control**: Git

---

## 📁 Project Structure

```
incubator/
├── backend/
│   ├── config/
│   │   ├── allowedOrigins.js       # CORS configuration
│   │   ├── compressionConfig.js    # Response compression
│   │   ├── corsConfig.js           # CORS options
│   │   ├── db.js                   # Database connection
│   │   ├── headersConfig.js        # Custom headers
│   │   ├── helmetConfig.js         # Security headers
│   │   ├── limiterConfig.js        # Rate limiting
│   │   ├── notifier.js             # Email notifications
│   │   └── rolesList.js            # User role definitions
│   ├── controllers/
│   │   ├── accelerationStatusController.js
│   │   ├── aiControllers.js        # AI chatbot logic
│   │   ├── authController.js       # Authentication
│   │   ├── facultiesController.js
│   │   ├── faqController.js
│   │   ├── juryController.js
│   │   ├── juryMembreController.js
│   │   ├── juryMembreRoleController.js
│   │   ├── locationsController.js
│   │   ├── logoutController.js
│   │   ├── partnersController.js
│   │   ├── preIncubationStatusController.js
│   │   ├── projectsController.js
│   │   ├── refreshTokenController.js
│   │   ├── registerController.js
│   │   ├── registrationControllers.js
│   │   ├── usersController.js
│   │   └── userStatusController.js
│   ├── logs/
│   │   ├── errLog.txt              # Error logs
│   │   ├── reqLog.txt              # Request logs
│   │   ├── securityLog.txt         # Security events
│   │   └── unauthorizedReqLog.txt  # Unauthorized access
│   ├── middlewares/
│   │   ├── errorHandler.js         # Global error handling
│   │   ├── logEvents.js            # Event logging
│   │   ├── optionalJwt.js          # Optional authentication
│   │   ├── refreshOnRequest.js     # Token refresh
│   │   ├── secureMiddleware.js     # Security middleware
│   │   ├── verifyJWT.js            # JWT verification
│   │   └── verifyRoles.js          # Role-based access
│   ├── models/
│   │   ├── accelerationStatusModels.js
│   │   ├── FacultiesModels.js
│   │   ├── faqModels.js
│   │   ├── juryMembreModels.js
│   │   ├── juryMembreRoleModels.js
│   │   ├── juryModels.js
│   │   ├── locationsModels.js
│   │   ├── partnersModels.js
│   │   ├── preIncubationStatusModels.js
│   │   ├── projectsModels.js
│   │   ├── registrationModels.js
│   │   ├── tokensModels.js
│   │   └── UsersModels.js
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── routes/
│   │   ├── accelerationStatusRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── facultiesRoutes.js
│   │   ├── faqRoutes.js
│   │   ├── juryMembreRoleRoutes.js
│   │   ├── juryMembreRoutes.js
│   │   ├── juryRoutes.js
│   │   ├── locationsRoutes.js
│   │   ├── partnersRoutes.js
│   │   ├── preIncubationStatusRoutes.js
│   │   ├── projectsRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── usersRoutes.js
│   ├── utils/
│   │   ├── fingerprintUtils.js     # Device fingerprinting
│   │   ├── getRealIP.js            # IP detection
│   │   └── tokensAndCookiesUtils.js # Token management
│   ├── package.json
│   └── server.js                   # Application entry point
│
├── frontend/
│   ├── public/
│   │   └── incubator_logo.png     # University logo
│   ├── src/
│   │   ├── assets/                # Static assets
│   │   ├── components/
│   │   │   ├── dashboards/
│   │   │   │   ├── AccelerationStatusManagement.vue
│   │   │   │   ├── FacultiesManagement.vue
│   │   │   │   ├── FAQManagement.vue
│   │   │   │   └── ... (more dashboard components)
│   │   │   └── AiChat.vue         # AI Assistant component
│   │   ├── router/
│   │   │   └── index.js           # Vue Router configuration
│   │   ├── stores/
│   │   │   └── useAuthStore.js    # Authentication state
│   │   ├── utils/
│   │   │   └── getFingerprint.js  # Device fingerprinting
│   │   ├── views/
│   │   │   ├── Dashboard.vue      # Main dashboard
│   │   │   ├── Home.vue           # Landing page
│   │   │   ├── Login.vue          # Login page
│   │   │   ├── Register.vue       # Project registration
│   │   │   └── RegistrationSuccess.vue
│   │   ├── api.js                 # Axios configuration
│   │   ├── App.vue                # Root component
│   │   ├── main.js                # Application entry
│   │   └── style.css              # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **PostgreSQL**: Version 13.x or higher
- **Git**: Latest version

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Youcef-Berbague/incubator.git
cd incubator
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE incubator_db;
```

2. Configure environment variables (see [Environment Variables](#environment-variables))

3. Run Prisma migrations:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/incubator_db"

# JWT Secrets
ACCESS_TOKEN_SECRET="your-access-token-secret-here"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-here"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# AI Configuration (if using external AI API)
AI_API_KEY=your-ai-api-key
AI_API_URL=https://api.example.com
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### Development Mode

**Backend:**

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend:**

```bash
cd frontend
npm run dev
# Application runs on http://localhost:5173
```

### Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Cookie: refreshToken=xxx
```

#### Logout

```http
POST /auth/logout
Cookie: refreshToken=xxx
```

### Project Registration Endpoints

#### Register Project

```http
POST /projects/register
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "projectTitle": "AI-Powered Agriculture System",
  "numberOfStudents": 2,
  "numberOfSupervisors": 1,
  "facultyId": 1,
  "departmentId": 5,
  "students": [
    {
      "firstName": "Ahmed",
      "lastName": "Benali",
      "email": "ahmed.benali@student.univ-annaba.dz",
      "phone": "+213555123456",
      "academicLevel": "Master 2"
    }
  ],
  "supervisors": [
    {
      "firstName": "Dr. Karim",
      "lastName": "Meziane",
      "email": "k.meziane@univ-annaba.dz",
      "phone": "+213661234567"
    }
  ]
}
```

### Faculty & Department Endpoints

#### Get All Faculties

```http
GET /faculties
```

#### Get Departments by Faculty

```http
GET /faculties/:facultyId/departments
```

### User Management (Admin Only)

#### Get All Users

```http
GET /users
Authorization: Bearer {accessToken}
```

#### Update User

```http
PATCH /users/:id
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "Updated Name",
  "role": "ADMIN"
}
```

#### Delete User

```http
DELETE /users/:id
Authorization: Bearer {accessToken}
```

### AI Chat Endpoints

#### Send Message

```http
POST /ai/chat
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "message": "What is the incubator program?",
  "sessionId": "session-uuid-here"
}
```

**Response:**

```json
{
  "reply": "The incubator program provides...",
  "sessionId": "session-uuid-here"
}
```

---

## 🗄️ Database Schema

### Core Tables

#### Users

- `id`: Primary key
- `email`: Unique email address
- `password`: Hashed password
- `firstName`: User's first name
- `lastName`: User's last name
- `role`: USER | ADMIN | SUPER_ADMIN
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

#### Projects

- `id`: Primary key
- `title`: Project title
- `description`: Project description
- `facultyId`: Foreign key to Faculties
- `departmentId`: Foreign key to Departments
- `statusId`: Current project status
- `createdAt`: Project creation date
- `updatedAt`: Last update date

#### Faculties

- `id`: Primary key
- `name`: Faculty name
- `description`: Faculty description

#### Departments

- `id`: Primary key
- `name`: Department name
- `facultyId`: Foreign key to Faculties

#### RefreshTokens

- `id`: Primary key
- `token`: Hashed refresh token
- `userId`: Foreign key to Users
- `fingerprint`: Device fingerprint
- `expiresAt`: Token expiration
- `createdAt`: Token creation time

---

## 🔐 Authentication & Authorization

### JWT Token System

The application uses a dual-token authentication system:

1. **Access Token**

   - Short-lived (15 minutes)
   - Sent in HTTP-only cookie
   - Used for API authentication
   - Contains user ID and role

2. **Refresh Token**
   - Long-lived (7-30 days based on "Remember Me")
   - Stored in HTTP-only cookie
   - Used to obtain new access tokens
   - Tied to device fingerprint

### User Roles

- **USER**: Regular users (students, supervisors)
- **ADMIN**: Administrative access
- **SUPER_ADMIN**: Full system access

### Role-Based Access Control (RBAC)

```javascript
// Example: Protecting routes
verifyJWT, // Verify authentication
  verifyRoles(ROLES.ADMIN), // Require admin role
  controller.adminAction;
```

---

## 🎨 Frontend Architecture

### Vue Router Configuration

```javascript
const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
];
```

### State Management (Pinia)

**Authentication Store:**

```javascript
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),
  actions: {
    async login(email, password) {
      /* ... */
    },
    async logout() {
      /* ... */
    },
    async checkAuth() {
      /* ... */
    },
  },
});
```

### Component Structure

- **Views**: Page-level components
- **Components**: Reusable UI components
- **Dashboards**: Role-specific dashboard components

### Design System

**Color Palette:**

- Primary Green: `#61ce70`
- Secondary Green: `#23a455`
- Tertiary Red: `#ff6b6b`
- Gray: `#54595f`

**Typography:**

- Font Family: Inter, system fonts
- Responsive font sizes
- Clear hierarchy

---

## 🏗️ Backend Architecture

### Middleware Stack

1. **Security Middleware**

   - Helmet (HTTP headers)
   - CORS configuration
   - Rate limiting
   - Compression

2. **Authentication Middleware**

   - JWT verification
   - Token refresh
   - Optional authentication

3. **Logging Middleware**

   - Request logging
   - Error logging
   - Security event logging

4. **Error Handling**
   - Global error handler
   - Custom error responses
   - Error logging

### Controller Pattern

```javascript
const getResource = async (req, res) => {
  try {
    const data = await Model.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
```

### Model Layer (Prisma)

```javascript
const prisma = new PrismaClient();

// Example query
const users = await prisma.user.findMany({
  where: { role: "USER" },
  include: { projects: true },
});
```

---

## 🔒 Security Features

### Implemented Security Measures

1. **HTTP Security Headers** (Helmet.js)

   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - HSTS

2. **CORS Protection**

   - Whitelisted origins
   - Credentials support
   - Pre-flight handling

3. **Rate Limiting**

   - Request rate limiting
   - Brute force protection
   - IP-based throttling

4. **Input Validation**

   - Server-side validation
   - Client-side validation
   - SQL injection prevention

5. **XSS Protection**

   - DOMPurify sanitization
   - HTML escaping
   - CSP headers

6. **Authentication Security**

   - Password hashing (bcrypt)
   - JWT tokens
   - Device fingerprinting
   - Token rotation

7. **Cookie Security**
   - HTTP-only cookies
   - Secure flag (HTTPS)
   - SameSite attribute

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**

```
Error: Can't reach database server
```

**Solution:** Check PostgreSQL service and DATABASE_URL in .env

**CORS Error:**

```
Access-Control-Allow-Origin blocked
```

**Solution:** Verify FRONTEND_URL in backend .env matches frontend URL

**JWT Token Expired:**

```
401 Unauthorized
```

**Solution:** Token refresh should happen automatically, check cookie settings

**Port Already in Use:**

```
EADDRINUSE: Port 5000 already in use
```

**Solution:** Kill process or change PORT in .env

---

## 📝 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

© 2025 Badji Mokhtar University, Annaba, Algeria. All rights reserved.

---

## 📞 Support

For technical support or questions:

- **Email**: incubator@univ-annaba.dz
- **Phone**: +213 (0)38 87 54 21
- **Address**: BP 12, Annaba 23000, Algeria

---

**Last Updated**: December 6, 2025  
**Version**: 1.0.0  
**Maintainers**: Badji Mokhtar University IT Team
