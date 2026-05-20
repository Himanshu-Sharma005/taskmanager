# Deployment Guide: Team Task Manager

This guide walks you through deploying your **Team Task Manager** application in production for free! We will deploy the **Backend Node/Express API** to **Railway**, connect a **MongoDB Atlas Cloud Database**, and deploy the **React Frontend**.

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

Since our local database won't be accessible by our deployed server on the cloud, we need a cloud-hosted database. MongoDB Atlas offers a generous 100% free tier.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create Database** and select the **M0 Free Shared Tier**.
3. Choose your nearest cloud server provider (e.g., AWS, GCP) and region.
4. **Security Configuration**:
   * Create a database user. Input a secure **Username** and **Password** (Save these!).
   * Under **IP Access List**, click **Allow Access from Anywhere** (`0.0.0.0/0`). This is necessary so that our Railway server can securely query the database.
5. Once the cluster is created, click **Connect** -> **Drivers**.
6. Copy the provided connection string. It will look like this:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
7. Replace `<username>` and `<password>` with the database credentials you saved in step 4. This is your production `MONGO_URI`!

---

## Step 2: Prepare Frontend for Production API

Before deploying, we must configure our React app to point to our *production* backend URL rather than `localhost:5000` when running in the cloud.

We have preconfigured your `client/src/services/api.js` to look for a dynamic environment variable:
```javascript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
```
When we host the frontend, we will simply inject the environment variable `VITE_API_URL` pointing to our deployed Railway domain!

---

## Step 3: Deploy Backend Server to Railway

Railway is a premium cloud developer platform that deploys projects instantly directly from GitHub.

1. Create a [Railway.app](https://railway.app/) account (Sign up using your GitHub account).
2. Push your `teamtaskmanager` workspace folder to a private or public repository on GitHub.
3. On your Railway Dashboard, click **New Project** -> **Deploy from GitHub repo**.
4. Authorize Railway to access your repository and select your project repo.
5. **Configure Root Directory**:
   * Since this is a monorepo containing both `/client` and `/server`, click on **Settings** in your Railway service card.
   * Under the **Root Directory** field, set it to `/server`. This tells Railway to compile and run ONLY our Node backend!
6. **Set Environment Variables**:
   * Go to the **Variables** tab in your service and click **New Variable** to add:
     * `PORT` = `5000`
     * `MONGO_URI` = `your_atlas_connection_string_from_step_1`
     * `JWT_SECRET` = `some_long_highly_secure_random_string`
     * `NODE_ENV` = `production`
7. Railway will automatically detect `package.json`, install packages, and deploy.
8. Once built, go to the **Settings** tab, scroll to **Networking**, and click **Generate Domain**. Copy this domain URL! (It will look like `https://server-production-xxxx.up.railway.app`). This is your production backend API domain!

---

## Step 4: Deploy Frontend Client

You can deploy the React app to Railway, Vercel, Netlify, or render. Vercel and Netlify are completely free and specialized in frontend hosting.

### Option A: Deploy Frontend to Vercel (Recommended & Easiest)
1. Sign up for a free [Vercel](https://vercel.com/) account using your GitHub details.
2. Click **Add New** -> **Project** and import your GitHub repository.
3. **Configure Settings**:
   * **Framework Preset**: Select **Vite**.
   * **Root Directory**: Select `client` (Click edit and choose `/client`).
4. **Configure Environment Variables**:
   * Add a new environment variable:
     * Key: `VITE_API_URL`
     * Value: `https://your-railway-backend-domain.up.railway.app/api` (Make sure to append `/api` to the end of the Railway domain you generated in Step 3!)
5. Click **Deploy**. Vercel will build your static files and give you a live production website address!

---

## Step 5: Test Your Live App!
1. Open your live Vercel URL.
2. Register a new user. 
3. Check your MongoDB Atlas Collections inside the browser panel—you will see your new user record, securely hashed, live in the cloud database!
