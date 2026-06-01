# Collaborative Writing & Publishing Workspace — Backend API

A production-style Node.js backend for collaborative document writing and publishing with role-based access control.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Validation:** express-validator.

---

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB running locally or a MongoDB Atlas connection string

### Installation

```bash
# Clone / navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create .env file (or edit the existing one)
# The .env file is already included with defaults
```

### Environment Variables

| Variable             | Default                                         | Description               |
| -------------------- | ----------------------------------------------- | ------------------------- |
| `PORT`               | `5000`                                          | Server port               |
| `MONGODB_URI`        | `mongodb://localhost:27017/collaborative_writing_db` | MongoDB connection string |
| `JWT_SECRET`         | *(change in production)*                        | JWT signing secret        |
| `JWT_EXPIRE`         | `30m`                                           | JWT access token expiry   |
| `JWT_REFRESH_SECRET` | *(change in production)*                        | JWT refresh token secret  |
| `JWT_REFRESH_EXPIRE` | `30d`                                           | JWT refresh token expiry  |

### Run the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## Folder Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Auth handlers
│   ├── workspaceController.js
│   ├── documentController.js
│   └── commentController.js
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── roleMiddleware.js     # Workspace role checks
│   └── errorHandler.js       # Centralized error handler
├── models/
│   ├── User.js
│   ├── Workspace.js
│   ├── Document.js
│   ├── Comment.js
│   └── ActivityLog.js
├── routes/
│   ├── authRoutes.js
│   ├── workspaceRoutes.js
│   ├── documentRoutes.js
│   └── commentRoutes.js
├── services/
│   ├── authService.js
│   ├── workspaceService.js
│   ├── documentService.js
│   ├── commentService.js
│   └── activityLogService.js
├── utils/
│   ├── ErrorResponse.js
│   └── generateToken.js
├── app.js                    # Express app config
├── server.js                 # Entry point
├── .env
├── .gitignore
└── package.json
```

---

## API Reference

### Auth Routes

| Method | Endpoint             | Auth | Description                   |
| ------ | -------------------- | ---- | ----------------------------- |
| POST   | `/api/auth/register` | No   | Register a new user           |
| POST   | `/api/auth/login`    | No   | Login & get tokens            |
| POST   | `/api/auth/refresh`  | No   | Refresh access & refresh token|
| POST   | `/api/auth/logout`   | Yes  | Revoke session (Logout)       |
| GET    | `/api/auth/profile`  | Yes  | Get current profile           |
| DELETE | `/api/auth/profile`  | Yes  | Delete account & cascade clean|

### Workspace Routes

| Method | Endpoint                       | Auth | Description               |
| ------ | ------------------------------ | ---- | ------------------------- |
| POST   | `/api/workspaces`              | Yes  | Create workspace          |
| GET    | `/api/workspaces`              | Yes  | List user's workspaces    |
| GET    | `/api/workspaces/:id`          | Yes  | Get workspace details     |
| PUT    | `/api/workspaces/:id`          | Yes  | Update workspace (Owner)  |
| DELETE | `/api/workspaces/:id`          | Yes  | Delete workspace (Owner)  |
| POST   | `/api/workspaces/:id/members`  | Yes  | Add/remove members (Owner)|
| GET    | `/api/workspaces/:id/logs`     | Yes  | Get activity logs         |
| GET    | `/api/workspaces/:id/documents`| Yes  | Get workspace documents   |
| POST   | `/api/workspaces/:id/leave`    | Yes  | Leave workspace           |


### Document Routes

| Method | Endpoint                       | Auth | Description             |
| ------ | ------------------------------ | ---- | ----------------------- |
| POST   | `/api/documents`               | Yes  | Create document         |
| GET    | `/api/documents/:id`           | Yes  | Get document            |
| PUT    | `/api/documents/:id`           | Yes  | Update document         |
| DELETE | `/api/documents/:id`           | Yes  | Delete document         |
| POST   | `/api/documents/:id/publish`   | Yes  | Publish/unpublish       |

### Comment Routes

| Method | Endpoint                       | Auth | Description             |
| ------ | ------------------------------ | ---- | ----------------------- |
| POST   | `/api/comments`                | Yes  | Add comment             |
| GET    | `/api/comments/:documentId`    | Yes  | Get document comments   |

---

## Postman Testing Examples

### 1. Register User

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

> Copy the `token` from the response. Use it in all subsequent requests as:
> `Authorization: Bearer <token>`

### 3. Get Profile

```
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <token>
```

### 3a. Refresh Token

```
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

### 3b. Logout

```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer <token>
```

### 4. Create Workspace

```
POST http://localhost:5000/api/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My First Workspace",
  "description": "A workspace for collaborative writing"
}
```

### 5. Add Member to Workspace

```
POST http://localhost:5000/api/workspaces/<workspaceId>/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "jane@example.com",
  "role": "editor",
  "action": "add"
}
```

### 6. Create Document

```
POST http://localhost:5000/api/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Getting Started Guide",
  "content": "This is the first draft of our guide...",
  "workspaceId": "<workspaceId>"
}
```

### 7. Publish Document

```
POST http://localhost:5000/api/documents/<documentId>/publish
Authorization: Bearer <token>
```

### 8. Add Comment

```
POST http://localhost:5000/api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": "<documentId>",
  "comment": "Great first draft! Let's add more examples."
}
```

### 9. Get Comments

```
GET http://localhost:5000/api/comments/<documentId>
Authorization: Bearer <token>
```

### 10. Get Activity Logs

```
GET http://localhost:5000/api/workspaces/<workspaceId>/logs
Authorization: Bearer <token>
```

---

## User Roles

| Role     | Scope     | Permissions                                    |
| -------- | --------- | ---------------------------------------------- |
| `admin`  | System    | Full access to all workspaces                  |
| `owner`  | Workspace | Full CRUD, manage members                      |
| `editor` | Workspace | Create/edit/publish documents, add comments    |
| `viewer` | Workspace | Read documents, add comments                   |

---

## License

ISC
