# Agent Management System - MERN Stack - Backend

A full-stack application for managing agents and distributing leads built with MongoDB, Express.js, React, and Node.js.

## Features

- **Admin Authentication**: Secure login system using JWT cookies
- **Agent Management**: Create, view, and delete agents with complete details
- **CSV Upload**: Upload CSV/Excel files with lead data
- **Automatic Distribution**: Leads are automatically distributed equally among agents
- **Lead Tracking**: View all leads and their assigned agents
- **Statistics Dashboard**: Real-time overview of agents and lead distribution

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- CSV Parser & XLSX for file processing
 
## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js
- MongoDB
- npm

## Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/kavitasoren02/Machine-test-backend.git
cd Machine-test-backend
```

### Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agent-management
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Running the Application

### Start Backend Server

```bash
# From backend directory
npm run dev
```

The backend server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Agents
- `POST /api/agents` - Create new agent
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get single agent
- `DELETE /api/agents/:id` - Delete agent

### Leads
- `POST /api/leads/upload` - Upload and distribute leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/stats` - Get distribution statistics
- `GET /api/leads/agent/:agentId` - Get leads by agent

## Project Structure
```
agent-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── agentController.js
│   │   └── leadController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Agent.js
│   │   └── Lead.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── agentRoutes.js
│   │   └── leadRoutes.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── server.js
```

## Development

### Backend Development

```bash
npm run dev  # Uses nodemon for auto-restart
```

### Build for Production
```bash
# Backend (no build needed, runs directly)
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check the connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `vite.config.js`

### CORS Errors
- Verify `CLIENT_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `server.js`

### File Upload Fails
- Check file format (CSV, XLSX, XLS only)
- Verify file size (max 5MB)
- Ensure `uploads/` directory exists in backend