# Team Task Manager

A full-stack project management application built using the **MERN Stack** (MongoDB, Express, React, Node.js) and custom **Tailwind CSS**. This project is designed specifically to showcase robust full-stack development, role-based authorization, and stateless authentication practices.

---

## 🚀 Key Features

* **Role-Based Access Control (RBAC)**: Supports distinct **Admin** and **Team Member** roles.
* **Admin Dashboard**: Create, edit, and delete projects; assign tasks to team members; manage deadlines; and track overall team progress.
* **Member Dashboard**: Access focused listings showing only assigned projects and tasks, with dynamic inline task status updates (Todo, In Progress, Completed).
* **Premium UX/UI**: Clean responsive SaaS interface styled with vanilla **Tailwind CSS**, featuring custom HSL color palettes, dynamic hovers, and fluid animations.
* **Stateless Security**: Fully authenticated API endpoints guarded by secure **JSON Web Tokens (JWT)** and **bcryptjs** password hashing.
* **Axios Request Interceptor**: Automatic injection of Bearer Auth tokens into client request headers.
* **Cascading Deletions**: Mongoose database integrity is maintained by automatically clearing associated task lists when a parent project is deleted.

---

## 🛠️ Technology Stack

* **Frontend**: React.js (Vite), React Router DOM (v6), Context API (Auth state), Axios, Tailwind CSS
* **Backend**: Node.js, Express.js, JWT, bcryptjs, cors, dotenv
* **Database**: MongoDB & Mongoose ODM

---

## 📂 Project Structure

```text
teamtaskmanager/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Custom UI Widgets (Navbar, Sidebar, ProtectedRoute)
│   │   ├── context/        # Auth Context API Provider
│   │   ├── pages/          # Application Pages (Login, Signup, Dashboard, Projects, Tasks)
│   │   ├── services/       # Network API Clients (Axios setup)
│   │   ├── App.jsx         # App Router Configuration
│   │   └── main.jsx        # Mount point
│   └── index.html
└── server/                 # Express Backend
    ├── config/             # DB Connection Logic
    ├── controllers/        # Express Routing Handlers (Auth, Projects, Tasks)
    ├── middleware/         # Security Middlewares (JWT check, role authorization)
    ├── models/             # Mongoose Schemas (User, Project, Task)
    ├── routes/             # API Endpoints Map
    └── server.js           # Server Initialization
```

---

## ⚙️ Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/en/) installed on your computer.
* [MongoDB](https://www.mongodb.com/try/download/community) community edition running locally, OR a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.

### 1. Backend Setup
1. Open a terminal and navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependecies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server/` directory and add the following keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/teamtaskmanager
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a second terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

Open your browser and navigate to `http://localhost:5173`. You can register a new user as an Admin or Member to begin testing!
