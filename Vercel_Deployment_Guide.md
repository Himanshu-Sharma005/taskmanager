# Vercel Deployment Guide — Team Task Manager

Deploying your fullstack application to Vercel is completely free and highly reliable. Since this is a fullstack app with a separate **client** (Vite/React) and **server** (Node.js/Express), we deploy them as **two separate projects** in Vercel linked to the same GitHub repository.

---

## 🛠️ Step 1: Deploying the Backend API Server

1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)** and click **Add New > Project**.
2. Import your repository: `Himanshu-Sharma005/taskmanager`.
3. Configure the Project Settings:
   - **Project Name**: `taskmanager-api` (or any backend-specific name)
   - **Framework Preset**: Select **Other**
   - **Root Directory**: Click `Edit` and select **`server`**
4. Expand the **Environment Variables** section and add the following keys from your server `.env`:
   - `PORT`: `5000`
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_jwt_secret_key`
   - `NODE_ENV`: `production`
5. Click **Deploy**. Vercel will build your serverless Express app using the included `server/vercel.json` file.
6. Once deployed, copy your **Vercel Backend URL** (e.g. `https://taskmanager-api.vercel.app`).

---

## 💻 Step 2: Deploying the Frontend Client

1. Go back to your **Vercel Dashboard** and click **Add New > Project**.
2. Import the same repository: `Himanshu-Sharma005/taskmanager`.
3. Configure the Project Settings:
   - **Project Name**: `team-task-manager`
   - **Framework Preset**: Select **Vite**
   - **Root Directory**: Click `Edit` and select **`client`**
4. Expand the **Environment Variables** section and add:
   - `VITE_API_URL`: `https://your-backend-vercel-url.vercel.app/api`
     *(Make sure to append `/api` to the backend URL you copied in Step 1!)*
5. Click **Deploy**. Vercel will compile the assets and host your frontend React app safely with the route rewrites configured in `client/vercel.json`.

---

## 🚀 Live Testing & Updates

- **Automatic Deploys**: Every time you commit and push to the `main` branch of your GitHub repository, Vercel will automatically redeploy both your frontend and backend projects!
- **CORS Support**: The backend server is pre-configured with `cors()` so it will seamlessly accept requests originating from your Vercel frontend URL.
