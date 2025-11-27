# Project Registration API Module

## Overview

This module implements a complete, production-ready Project Registration API for the Innovation Incubator system. It follows clean architecture principles and adheres to the API specification document.

## Module Structure

```
backend/
├── routes/
│   └── registrationRoutes.js       # API route definitions
├── controllers/
│   └── registrationControllers.js  # Business logic and request handling
├── models/
│   └── registrationModels.js       # Database operations using Prisma
└── server.js                        # Route registration (updated)
```

## Features

### ✅ Implemented Endpoints

1. **POST /api/projects/register** - Submit new project registration (Public)
2. **GET /api/registrations** - Get all registrations with filters (Admin only)
3. **GET /api/registrations/:id** - Get single registration by ID (Admin only)
4. **PATCH /api/registrations/:id/status** - Update registration status (Admin only)
5. **DELETE /api/registrations/:id** - Delete registration (SuperAdmin only)

### ✅ Key Features

- **Transaction Support**: Uses Prisma transactions for atomic multi-table inserts
- **Comprehensive Validation**: Validates all fields according to API spec
- **Relational Integrity**: Ensures faculty-department relationships are valid
- **Duplicate Detection**: Prevents duplicate project titles within same faculty
- **Cascading Deletes**: Automatically removes students and supervisors when registration is deleted
- **Pagination**: Supports pagination for listing registrations
- **Filtering**: Filter by status, faculty, and department
- **Clean Response Format**: All responses follow `{ success, message, data }` format
- **Error Handling**: Proper error messages for all scenarios
- **Security**: Protected routes require authentication and role-based access

## API Endpoints Details

### 1. Submit Project Registration

**Endpoint:** `POST /api/projects/register`

**Access:** Public (no authentication required)

**Request Body:**

```json
{
  "projectTitle": "AI-Powered Educational Platform",
  "numberOfStudents": 3,
  "numberOfSupervisors": 2,
  "facultyId": 1,
  "departmentId": 5,
  "students": [
    {
      "firstName": "Ahmed",
      "lastName": "Benali",
      "email": "ahmed.benali@student.univ-annaba.dz",
      "phone": "+213 555 123 456",
      "academicLevel": "M1"
    }
  ],
  "supervisors": [
    {
      "firstName": "Dr. Karim",
      "lastName": "Boudjemaa",
      "email": "k.boudjemaa@univ-annaba.dz",
      "phone": "+213 555 345 678"
    }
  ]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Project registration submitted successfully",
  "data": {
    "registrationId": 123,
    "projectTitle": "AI-Powered Educational Platform",
    "status": "pending",
    "submittedAt": "2025-11-26T10:30:00Z"
  }
}
```

**Error Response (400 - Validation Error):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "students[0].email",
      "message": "Invalid email format"
    }
  ]
}
```

### 2. Get All Registrations

**Endpoint:** `GET /api/registrations?status=pending&facultyId=1&page=1&limit=10`

**Access:** Admin or SuperAdmin only

**Query Parameters:**

- `status` (optional): Filter by status (pending, in_review, approved, rejected, etc.)
- `facultyId` (optional): Filter by faculty ID
- `departmentId` (optional): Filter by department ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "id": 123,
        "projectTitle": "AI-Powered Educational Platform",
        "status": "pending",
        "submittedAt": "2025-11-26T10:30:00Z",
        "faculty": {
          "id": 1,
          "name": "Faculty of Technology",
          "nameEn": "Faculty of Technology"
        },
        "department": {
          "id": 5,
          "name": "Computer Science",
          "nameEn": "Computer Science"
        },
        "numberOfStudents": 3,
        "numberOfSupervisors": 2
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

### 3. Get Registration by ID

**Endpoint:** `GET /api/registrations/:id`

**Access:** Admin or SuperAdmin only

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "projectTitle": "AI-Powered Educational Platform",
    "status": "pending",
    "submittedAt": "2025-11-26T10:30:00Z",
    "faculty": {
      "id": 1,
      "name": "Faculty of Technology",
      "nameEn": "Faculty of Technology"
    },
    "department": {
      "id": 5,
      "name": "Computer Science",
      "nameEn": "Computer Science"
    },
    "students": [
      {
        "id": 1,
        "firstName": "Ahmed",
        "lastName": "Benali",
        "email": "ahmed.benali@student.univ-annaba.dz",
        "phone": "+213 555 123 456",
        "academicLevel": "M1"
      }
    ],
    "supervisors": [
      {
        "id": 1,
        "firstName": "Dr. Karim",
        "lastName": "Boudjemaa",
        "email": "k.boudjemaa@univ-annaba.dz",
        "phone": "+213 555 345 678"
      }
    ]
  }
}
```

### 4. Update Registration Status

**Endpoint:** `PATCH /api/registrations/:id/status`

**Access:** Admin or SuperAdmin only

**Request Body:**

```json
{
  "status": "approved",
  "reviewerNotes": "Excellent project proposal"
}
```

**Valid Status Values:**

- `pending` - Initial status
- `in_review` - Under review
- `approved` - Approved
- `rejected` - Rejected
- `revision_required` - Needs changes
- `withdrawn` - Withdrawn by submitter

**Success Response (200):**

```json
{
  "success": true,
  "message": "Registration status updated successfully",
  "data": {
    "id": 123,
    "status": "approved"
  }
}
```

### 5. Delete Registration

**Endpoint:** `DELETE /api/registrations/:id`

**Access:** SuperAdmin only

**Success Response (200):**

```json
{
  "success": true,
  "message": "Registration deleted successfully",
  "data": {
    "id": 123
  }
}
```

## Validation Rules

### Project Title

- **Required:** Yes
- **Min Length:** 5 characters
- **Max Length:** 255 characters

### Number of Students

- **Required:** Yes
- **Range:** 1-6
- **Must match:** Length of students array

### Number of Supervisors

- **Required:** Yes
- **Range:** 1-3
- **Must match:** Length of supervisors array

### Student Fields

- `firstName`: Required, 2-100 characters, letters only
- `lastName`: Required, 2-100 characters, letters only
- `email`: Required, valid email format
- `phone`: Optional, valid phone format
- `academicLevel`: Required, must be one of: L1, L2, L3, M1, M2, PhD

### Supervisor Fields

- `firstName`: Required, 2-100 characters, letters only
- `lastName`: Required, 2-100 characters, letters only
- `email`: Required, valid email format
- `phone`: Optional, valid phone format

### Faculty & Department

- `facultyId`: Must exist in database
- `departmentId`: Must exist and belong to selected faculty

## Database Schema

The module uses three related tables:

```sql
-- Main registration table
project_registrations (
  id, title, faculty_id, departement_id,
  status, submitted_at
)

-- Students table
registration_students (
  id, registration_id, first_name, last_name,
  email, phone, academic_level
)

-- Supervisors table
registration_supervisors (
  id, registration_id, first_name, last_name,
  email, phone
)
```

**Cascade Delete:** When a registration is deleted, all associated students and supervisors are automatically removed.

## Security

### Authentication & Authorization

- **Public Endpoint:** `/api/projects/register` - No authentication required
- **Admin Endpoints:** `/api/registrations/*` - Requires JWT authentication + Admin role
- **SuperAdmin Endpoints:** `DELETE /api/registrations/:id` - Requires SuperAdmin role

### Role Requirements

Routes are protected using:

```javascript
verifyJWT; // Validates JWT token
verifyRoles([ROLES.admin, ROLES.superAdmin]); // Checks user role
```

### Input Validation

All inputs are validated for:

- Data types and formats
- Length constraints
- Email format (RFC 5322)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (input sanitization)

## Testing

### Manual Testing with cURL

**Submit Registration:**

```bash
curl -X POST http://localhost:3000/api/projects/register \
  -H "Content-Type: application/json" \
  -d '{
    "projectTitle": "Test Project",
    "numberOfStudents": 1,
    "numberOfSupervisors": 1,
    "facultyId": 1,
    "departmentId": 1,
    "students": [{
      "firstName": "Ahmed",
      "lastName": "Test",
      "email": "test@example.com",
      "phone": "+213555123456",
      "academicLevel": "M1"
    }],
    "supervisors": [{
      "firstName": "Dr. Test",
      "lastName": "Supervisor",
      "email": "supervisor@example.com",
      "phone": "+213555654321"
    }]
  }'
```

**Get All Registrations (requires auth):**

```bash
curl -X GET "http://localhost:3000/api/registrations?page=1&limit=10" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN"
```

## Error Handling

All errors follow consistent format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error information"
}
```

Common HTTP Status Codes:

- `200` - Success
- `201` - Created successfully
- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (duplicate data)
- `500` - Internal server error

## Performance Optimizations

1. **Database Indexes**: Created on frequently queried fields
2. **Prisma Select**: Only fetches required fields
3. **Transaction Batching**: Uses `createMany` for bulk inserts
4. **Pagination**: Limits data transfer for large result sets
5. **Query Optimization**: Uses `include` instead of multiple queries

## Future Enhancements

- [ ] Email notifications to students and supervisors
- [ ] File upload for project proposals
- [ ] Export registrations to CSV/Excel
- [ ] Advanced search and filtering
- [ ] Dashboard analytics
- [ ] Bulk status updates
- [ ] Email verification workflow

## Dependencies

- `express` - Web framework
- `@prisma/client` - Database ORM
- `jsonwebtoken` - JWT authentication (existing)
- `cookie-parser` - Cookie handling (existing)

## Notes

- All timestamps are in ISO 8601 format
- The API follows RESTful conventions
- Response format matches the API specification exactly
- Database schema uses Prisma naming conventions (snake_case)

## Support

For questions or issues, contact the development team.

---

**Last Updated:** November 26, 2025  
**Version:** 1.0.0  
**Author:** Backend Development Team
