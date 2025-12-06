# Jury Management APIs Documentation

## Overview

This document provides comprehensive documentation for the Jury Management System APIs. The system consists of three main modules:

1. **Juries** - Manage jury sessions for project evaluations
2. **Jury Members** - Manage jury member assignments and roles
3. **Jury Member Roles** - Manage role types for jury members

---

## Authentication & Authorization

All endpoints require JWT authentication via the `Authorization` header or HTTP-only cookies.

### Role Requirements:

- **SuperAdmin (777)**: Full access to all operations
- **Admin (555)**: Read and write access (limited delete permissions)
- **Supervisor (101), Coach (333)**: Can be jury members but cannot manage juries
- **Student (999)**: No access to jury management

---

## 1. Juries API (`/api/juries`)

### 1.1 Get All Juries

**Endpoint:** `GET /api/juries`  
**Access:** SuperAdmin, Admin

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "jury_code": "JURY-2024-001",
      "date": "2024-01-15T10:00:00.000Z",
      "so_partener_id": 1,
      "location_id": 2,
      "faculty_id": 3,
      "faculties": {
        "id": 3,
        "faculty_name": "Faculty of Sciences",
        "faculty_name_en": "Faculty of Sciences"
      },
      "locations": {
        "id": 2,
        "location_name": "Amphitheater A"
      },
      "socio_economic_partner": {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone_number": "0555123456"
      },
      "jury_membres_relation": [
        {
          "membre_id": 1,
          "jury_id": 1,
          "jury_membre": {
            "id": 1,
            "membre_id": 10,
            "role_id": 1,
            "users": {
              "id": 10,
              "first_name": "Ahmed",
              "last_name": "Benali",
              "email": "ahmed@univ.dz",
              "role": [101, 333]
            },
            "jury_membre_role": {
              "id": 1,
              "name": "President"
            }
          }
        }
      ],
      "jury_project": [
        {
          "jury_id": 1,
          "project_id": 5,
          "project": {
            "id": 5,
            "title": "AI-Based Healthcare System",
            "project_code": "PRJ-2024-005"
          }
        }
      ]
    }
  ]
}
```

---

### 1.2 Get Jury by ID

**Endpoint:** `GET /api/juries/:id`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `id` (integer) - Jury ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "jury_code": "JURY-2024-001",
    "date": "2024-01-15T10:00:00.000Z",
    "so_partener_id": 1,
    "location_id": 2,
    "faculty_id": 3,
    "faculties": { ... },
    "locations": { ... },
    "socio_economic_partner": { ... },
    "jury_membres_relation": [ ... ],
    "jury_project": [ ... ],
    "evaluation_sheet": [
      {
        "id": 1,
        "description": "Excellent presentation and innovative approach",
        "project_id": 5,
        "jury_id": 1,
        "project": {
          "id": 5,
          "title": "AI-Based Healthcare System"
        }
      }
    ]
  }
}
```

**Error Responses:**

- `400` - Invalid jury ID
- `404` - Jury not found

---

### 1.3 Create Jury

**Endpoint:** `POST /api/juries`  
**Access:** SuperAdmin, Admin

**Request Body:**

```json
{
  "jury_code": "JURY-2024-002",
  "date": "2024-02-20T14:00:00.000Z",
  "so_partener_id": 2,
  "location_id": 1,
  "faculty_id": 2
}
```

**Field Validations:**

- `jury_code` (required): String, max 100 characters, must be unique
- `date` (optional): Valid ISO 8601 date string
- `so_partener_id` (optional): Valid socio-economic partner ID
- `location_id` (optional): Valid location ID
- `faculty_id` (optional): Valid faculty ID

**Response:**

```json
{
  "success": true,
  "message": "Jury created successfully",
  "data": {
    "id": 2,
    "jury_code": "JURY-2024-002",
    "date": "2024-02-20T14:00:00.000Z",
    "so_partener_id": 2,
    "location_id": 1,
    "faculty_id": 2,
    "faculties": { ... },
    "locations": { ... },
    "socio_economic_partner": { ... }
  }
}
```

**Error Responses:**

- `400` - Missing or invalid fields
- `409` - Jury code already exists

---

### 1.4 Update Jury

**Endpoint:** `PUT /api/juries/:id`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `id` (integer) - Jury ID

**Request Body:**

```json
{
  "jury_code": "JURY-2024-002-UPDATED",
  "date": "2024-02-21T14:00:00.000Z",
  "so_partener_id": 3,
  "location_id": 2,
  "faculty_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Jury updated successfully",
  "data": { ... }
}
```

**Error Responses:**

- `400` - Invalid jury ID or fields
- `404` - Jury not found
- `409` - Jury code already exists

---

### 1.5 Delete Jury

**Endpoint:** `DELETE /api/juries/:id`  
**Access:** SuperAdmin only

**Parameters:**

- `id` (integer) - Jury ID

**Behavior:**

- Cascading delete: Removes all related `jury_membres_relation`, `jury_project`, and `evaluation_sheet` records

**Response:**

```json
{
  "success": true,
  "message": "Jury deleted successfully"
}
```

**Error Responses:**

- `400` - Invalid jury ID
- `404` - Jury not found

---

### 1.6 Get Jury Members

**Endpoint:** `GET /api/juries/:juryId/members`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `juryId` (integer) - Jury ID

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "membre_id": 1,
      "jury_id": 1,
      "jury_membre": {
        "id": 1,
        "membre_id": 10,
        "role_id": 1,
        "users": {
          "id": 10,
          "first_name": "Ahmed",
          "last_name": "Benali",
          "email": "ahmed@univ.dz",
          "role": [101, 333]
        },
        "jury_membre_role": {
          "id": 1,
          "name": "President"
        }
      }
    }
  ]
}
```

---

### 1.7 Assign Member to Jury

**Endpoint:** `POST /api/juries/:juryId/members/:memberId`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `juryId` (integer) - Jury ID
- `memberId` (integer) - Jury member ID (from `jury_membre` table)

**Response:**

```json
{
  "success": true,
  "message": "Member assigned to jury successfully",
  "data": {
    "membre_id": 2,
    "jury_id": 1,
    "jury_membre": { ... }
  }
}
```

**Error Responses:**

- `400` - Invalid jury ID or member ID
- `409` - Member is already assigned to this jury

---

### 1.8 Remove Member from Jury

**Endpoint:** `DELETE /api/juries/:juryId/members/:memberId`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `juryId` (integer) - Jury ID
- `memberId` (integer) - Jury member ID

**Response:**

```json
{
  "success": true,
  "message": "Member removed from jury successfully"
}
```

**Error Responses:**

- `400` - Invalid IDs
- `404` - Member assignment not found

---

### 1.9 Assign Projects to Jury

**Endpoint:** `POST /api/juries/:juryId/projects`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `juryId` (integer) - Jury ID

**Request Body:**

```json
{
  "projectIds": [5, 7, 12, 18]
}
```

**Behavior:**

- Replaces all existing project assignments for this jury
- Creates new assignments for all provided project IDs

**Response:**

```json
{
  "success": true,
  "message": "Projects assigned to jury successfully",
  "data": {
    "count": 4
  }
}
```

**Error Responses:**

- `400` - Invalid jury ID or missing project IDs array

---

## 2. Jury Members API (`/api/jury-members`)

### 2.1 Get All Jury Members

**Endpoint:** `GET /api/jury-members`  
**Access:** SuperAdmin, Admin

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "membre_id": 10,
      "role_id": 1,
      "users": {
        "id": 10,
        "first_name": "Ahmed",
        "last_name": "Benali",
        "email": "ahmed@univ.dz",
        "phone_number": "0555123456",
        "role": [101, 333]
      },
      "jury_membre_role": {
        "id": 1,
        "name": "President"
      },
      "jury_membres_relation": [
        {
          "membre_id": 1,
          "jury_id": 1,
          "jury": {
            "id": 1,
            "jury_code": "JURY-2024-001",
            "date": "2024-01-15T10:00:00.000Z"
          }
        }
      ]
    }
  ]
}
```

---

### 2.2 Get Jury Member by ID

**Endpoint:** `GET /api/jury-members/:id`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `id` (integer) - Jury member ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "membre_id": 10,
    "role_id": 1,
    "users": {
      "id": 10,
      "first_name": "Ahmed",
      "last_name": "Benali",
      "email": "ahmed@univ.dz",
      "phone_number": "0555123456",
      "role": [101, 333],
      "departement_id": 5,
      "departements": {
        "id": 5,
        "departement_name": "Computer Science"
      }
    },
    "jury_membre_role": {
      "id": 1,
      "name": "President"
    },
    "jury_membres_relation": [ ... ]
  }
}
```

---

### 2.3 Get Eligible Users

**Endpoint:** `GET /api/jury-members/eligible-users`  
**Access:** SuperAdmin, Admin

**Description:** Returns all users who have eligible roles to be jury members (Supervisor, Admin, Coach, SuperAdmin)

**Response:**

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 10,
      "first_name": "Ahmed",
      "last_name": "Benali",
      "email": "ahmed@univ.dz",
      "phone_number": "0555123456",
      "role": [101, 333],
      "departements": {
        "id": 5,
        "departement_name": "Computer Science"
      }
    }
  ]
}
```

---

### 2.4 Create Jury Member

**Endpoint:** `POST /api/jury-members`  
**Access:** SuperAdmin, Admin

**Request Body:**

```json
{
  "membre_id": 15,
  "role_id": 2
}
```

**Field Validations:**

- `membre_id` (required): Valid user ID from `users` table
- `role_id` (optional): Valid jury member role ID
- User must have one of the eligible roles: Supervisor (101), Admin (555), Coach (333), or SuperAdmin (777)

**Response:**

```json
{
  "success": true,
  "message": "Jury member created successfully",
  "data": {
    "id": 6,
    "membre_id": 15,
    "role_id": 2,
    "users": { ... },
    "jury_membre_role": { ... }
  }
}
```

**Error Responses:**

- `400` - Missing membre_id
- `403` - User does not have eligible role
- `404` - User not found
- `409` - User is already a jury member

---

### 2.5 Update Jury Member

**Endpoint:** `PUT /api/jury-members/:id`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `id` (integer) - Jury member ID

**Request Body:**

```json
{
  "membre_id": 15,
  "role_id": 3
}
```

**Response:**

```json
{
  "success": true,
  "message": "Jury member updated successfully",
  "data": { ... }
}
```

**Error Responses:**

- `400` - Invalid ID or missing fields
- `403` - User does not have eligible role
- `404` - Jury member or user not found

---

### 2.6 Delete Jury Member

**Endpoint:** `DELETE /api/jury-members/:id`  
**Access:** SuperAdmin only

**Parameters:**

- `id` (integer) - Jury member ID

**Behavior:**

- Cascading delete: Removes all related `jury_membres_relation` records

**Response:**

```json
{
  "success": true,
  "message": "Jury member deleted successfully"
}
```

**Error Responses:**

- `400` - Invalid ID
- `404` - Jury member not found

---

## 3. Jury Member Roles API (`/api/jury-member-roles`)

### 3.1 Get All Jury Member Roles

**Endpoint:** `GET /api/jury-member-roles`  
**Access:** SuperAdmin, Admin

**Response:**

```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "name": "President",
      "jury_membre": [
        {
          "id": 1,
          "membre_id": 10,
          "role_id": 1,
          "users": {
            "id": 10,
            "first_name": "Ahmed",
            "last_name": "Benali"
          }
        }
      ]
    },
    {
      "id": 2,
      "name": "Examiner",
      "jury_membre": [ ... ]
    }
  ]
}
```

---

### 3.2 Get Jury Member Role by ID

**Endpoint:** `GET /api/jury-member-roles/:id`  
**Access:** SuperAdmin, Admin

**Parameters:**

- `id` (integer) - Role ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "President",
    "jury_membre": [ ... ]
  }
}
```

---

### 3.3 Create Jury Member Role

**Endpoint:** `POST /api/jury-member-roles`  
**Access:** SuperAdmin only

**Request Body:**

```json
{
  "name": "Rapporteur"
}
```

**Field Validations:**

- `name` (required): String, max 30 characters, must be unique

**Response:**

```json
{
  "success": true,
  "message": "Jury member role created successfully",
  "data": {
    "id": 5,
    "name": "Rapporteur"
  }
}
```

**Error Responses:**

- `400` - Missing or invalid name (max 30 chars)
- `409` - Role name already exists

---

### 3.4 Update Jury Member Role

**Endpoint:** `PUT /api/jury-member-roles/:id`  
**Access:** SuperAdmin only

**Parameters:**

- `id` (integer) - Role ID

**Request Body:**

```json
{
  "name": "Senior Examiner"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Jury member role updated successfully",
  "data": {
    "id": 2,
    "name": "Senior Examiner"
  }
}
```

**Error Responses:**

- `400` - Invalid ID or name
- `404` - Role not found
- `409` - Role name already exists

---

### 3.5 Delete Jury Member Role

**Endpoint:** `DELETE /api/jury-member-roles/:id`  
**Access:** SuperAdmin only

**Parameters:**

- `id` (integer) - Role ID

**Validation:**

- Cannot delete role if any jury members are using it

**Response:**

```json
{
  "success": true,
  "message": "Jury member role deleted successfully"
}
```

**Error Responses:**

- `400` - Invalid ID
- `404` - Role not found
- `409` - Cannot delete role: X jury member(s) are using this role

---

## Database Schema

### jury Table

```prisma
model jury {
  id                     Int       @id @default(autoincrement())
  jury_code              String    @unique @db.VarChar(100)
  date                   DateTime? @db.Timestamp(6)
  so_partener_id         Int?
  location_id            Int?
  faculty_id             Int?

  // Relations
  faculties              faculties?
  locations              locations?
  socio_economic_partner socio_economic_partner?
  jury_membres_relation  jury_membres_relation[]
  jury_project           jury_project[]
  evaluation_sheet       evaluation_sheet[]
}
```

### jury_membre Table

```prisma
model jury_membre {
  id                    Int      @id @default(autoincrement())
  membre_id             Int?     // FK to users.id
  role_id               Int?     // FK to jury_membre_role.id

  // Relations
  users                 users?
  jury_membre_role      jury_membre_role?
  jury_membres_relation jury_membres_relation[]
}
```

### jury_membre_role Table

```prisma
model jury_membre_role {
  id          Int      @id @default(autoincrement())
  name        String?  @db.VarChar(30)

  // Relations
  jury_membre jury_membre[]
}
```

### jury_membres_relation Table (Junction)

```prisma
model jury_membres_relation {
  membre_id   Int
  jury_id     Int

  // Relations
  jury        jury
  jury_membre jury_membre

  @@id([membre_id, jury_id])
}
```

---

## Common Error Codes

| Status Code | Description                          |
| ----------- | ------------------------------------ |
| 200         | Success                              |
| 201         | Created successfully                 |
| 400         | Bad request (validation error)       |
| 401         | Unauthorized (missing/invalid token) |
| 403         | Forbidden (insufficient permissions) |
| 404         | Not found                            |
| 409         | Conflict (duplicate entry)           |
| 500         | Internal server error                |

---

## Usage Examples

### Example 1: Create a Complete Jury Session

```javascript
// Step 1: Create jury member roles
const presidentRole = await fetch("/api/jury-member-roles", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "President" }),
});

// Step 2: Get eligible users
const eligibleUsers = await fetch("/api/jury-members/eligible-users");

// Step 3: Create jury members
const member1 = await fetch("/api/jury-members", {
  method: "POST",
  body: JSON.stringify({ membre_id: 10, role_id: 1 }),
});

// Step 4: Create jury session
const jury = await fetch("/api/juries", {
  method: "POST",
  body: JSON.stringify({
    jury_code: "JURY-2024-FINAL",
    date: "2024-06-15T09:00:00Z",
    location_id: 1,
    faculty_id: 2,
  }),
});

// Step 5: Assign members to jury
await fetch(`/api/juries/${jury.data.id}/members/${member1.data.id}`, {
  method: "POST",
});

// Step 6: Assign projects
await fetch(`/api/juries/${jury.data.id}/projects`, {
  method: "POST",
  body: JSON.stringify({ projectIds: [5, 7, 12] }),
});
```

---

## Security Notes

1. **Role Validation**: Jury members must have roles: Supervisor (101), Admin (555), Coach (333), or SuperAdmin (777)
2. **Cascading Deletes**: Deleting a jury removes all related members, projects, and evaluation sheets
3. **Unique Constraints**: Jury codes must be unique across the system
4. **Access Control**: Most operations require SuperAdmin or Admin roles

---

## Frontend Integration

### Jury Member Roles Management Component

**Component:** `JuryMemberRolesManagement.vue`  
**Route:** `/dashboard/jury-member-roles`  
**Access:** SuperAdmin only

**Features:**

- ✅ View all jury member roles in a card grid layout
- ✅ Search roles by name
- ✅ Create new roles with validation (max 30 characters)
- ✅ Edit existing roles
- ✅ Delete roles (prevents deletion if role is in use)
- ✅ Display assigned members count for each role
- ✅ Show which members are assigned to each role
- ✅ Real-time validation and error handling
- ✅ Success/error notifications
- ✅ Responsive design for mobile and desktop
- ✅ Modern UI with smooth animations

**Navigation:**
The component is accessible from the SuperAdmin Dashboard sidebar under "System Configuration" section.

**Component Structure:**

```
JuryMemberRolesManagement.vue
├── Header (with back button)
├── Search & Stats
├── Roles Grid (card layout)
│   ├── Role Icon (👔)
│   ├── Role Name
│   ├── Members Count
│   ├── Assigned Members Tags
│   └── Action Buttons (Edit/Delete)
├── Create/Edit Modal
└── Delete Confirmation Modal
```

**API Integration:**

- `GET /api/jury-member-roles` - Fetch all roles
- `POST /api/jury-member-roles` - Create new role
- `PUT /api/jury-member-roles/:id` - Update role
- `DELETE /api/jury-member-roles/:id` - Delete role

---

### Juries Management Component

**Component:** `JuriesManagement.vue`  
**Route:** `/dashboard/juries`  
**Access:** SuperAdmin, Admin

**Features:**

- ✅ View all jury sessions in a card grid layout
- ✅ Search juries by code or date
- ✅ Display statistics (total juries, this month count)
- ✅ Create new jury sessions with validation
- ✅ Edit existing jury information
- ✅ Delete jury sessions (with cascade delete warning)
- ✅ Assign/remove members to/from juries
- ✅ Assign multiple projects to juries
- ✅ View jury members with their roles
- ✅ View assigned projects for each jury
- ✅ Display faculty, location, and partner information
- ✅ Real-time validation and error handling
- ✅ Success/error notifications
- ✅ Responsive design for mobile and desktop
- ✅ Modern UI with smooth animations and modals

**Navigation:**
The component is accessible from the SuperAdmin Dashboard sidebar under "Quick Actions" section.

**Component Structure:**

```
JuriesManagement.vue
├── Header (with back button and create button)
├── Search & Stats (search box + statistics badges)
├── Juries Grid (card layout)
│   ├── Jury Icon (⚖️)
│   ├── Jury Code & Date
│   ├── Details (Faculty, Location, Partner)
│   ├── Stats (Members Count, Projects Count)
│   └── Action Buttons
│       ├── Members (manage jury members)
│       ├── Projects (assign projects)
│       ├── Edit (edit jury information)
│       └── Delete (delete jury)
├── Create/Edit Jury Modal
│   ├── Jury Code Input (required, max 100 chars)
│   ├── Date & Time Picker
│   ├── Faculty Dropdown
│   ├── Location Dropdown
│   └── Partner Dropdown
├── Members Management Modal
│   ├── Assign New Member Form
│   │   ├── Member Dropdown (from eligible jury members)
│   │   └── Assign Button
│   └── Current Members List
│       ├── Member Avatar & Details
│       ├── Role Badge
│       └── Remove Button
├── Projects Assignment Modal
│   ├── Projects Selection Grid (checkboxes)
│   ├── Selected Count Display
│   ├── Currently Assigned Projects List
│   └── Assign Button
└── Delete Confirmation Modal
```

**API Integration:**

- `GET /api/juries` - Fetch all juries with full relations
- `POST /api/juries` - Create new jury
- `PUT /api/juries/:id` - Update jury
- `DELETE /api/juries/:id` - Delete jury (cascade)
- `GET /api/juries/:juryId/members` - Get jury members
- `POST /api/juries/:juryId/members/:memberId` - Assign member
- `DELETE /api/juries/:juryId/members/:memberId` - Remove member
- `POST /api/juries/:juryId/projects` - Assign projects
- `GET /api/jury-members` - Fetch all jury members
- `GET /api/faculties` - Fetch faculties for dropdown
- `GET /api/locations` - Fetch locations for dropdown
- `GET /api/partners` - Fetch partners for dropdown
- `GET /api/projects` - Fetch projects for assignment

**Key Features Explained:**

1. **Jury Session Management:**

   - Create jury sessions with unique codes (max 100 characters)
   - Set date/time for jury evaluations
   - Associate with faculty, location, and partner
   - Edit all jury information
   - Delete juries with cascade warning

2. **Member Management:**

   - Assign jury members from the pool of eligible members
   - View member details (name, email, role)
   - Remove members from jury
   - Visual member avatars with initials
   - Real-time member count display

3. **Project Assignment:**

   - Multi-select interface for project assignment
   - Visual checkboxes with project titles and codes
   - Replaces existing assignments with new selection
   - Shows count of selected projects
   - Displays currently assigned projects

4. **Data Display:**

   - Card grid layout for easy scanning
   - Color-coded action buttons
   - Member and project count badges
   - Faculty, location, and partner information
   - Formatted dates with time

5. **Validation & Error Handling:**
   - Jury code uniqueness validation
   - Character limit validation (100 chars)
   - Date format validation
   - Duplicate member assignment prevention
   - Graceful error messages
   - Success notifications

---

## Testing Checklist

- [ ] Create jury with all fields
- [ ] Create jury with minimal fields (only jury_code)
- [ ] Update jury information
- [ ] Delete jury (verify cascade delete)
- [ ] Get eligible users for jury
- [ ] Create jury member from eligible user
- [ ] Prevent creating jury member from non-eligible user
- [ ] Assign member to jury
- [ ] Remove member from jury
- [ ] Assign multiple projects to jury
- [ ] Create jury member roles
- [ ] Prevent deleting role in use
- [ ] Test all validation errors
- [ ] Test role-based access control

---

## Future Enhancements

1. Email notifications for jury member assignments
2. Calendar integration for jury dates
3. Automated evaluation sheet generation
4. Jury member availability tracking
5. Conflict of interest checking
6. Performance analytics for jury members

---

**Last Updated:** December 2024  
**API Version:** 1.0.0  
**Maintained by:** Badji Mokhtar University Incubator Development Team
