# Hospital Management System (HMS) Deployment Guide

This guide walks you through deploying the HMS backend (Express + Socket.io + Prisma) and frontend (Next.js) fully to the cloud.

---

## 1. Setup a Cloud Database (PostgreSQL)

Since SQLite is a local file-based database, a cloud PostgreSQL database is recommended for production.

### Using Supabase or Neon:
1. Sign up for [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
2. Create a new project/database.
3. Copy the **Transaction Connection String** (e.g., `postgresql://postgres:password@db.supabase.co:5432/postgres`).

---

## 2. Deploy the Backend (Express.js)

You can host the Node.js backend on [Render](https://render.com/) or [Railway](https://railway.app/).

### Steps for Render:
1. Log in to Render and click **New > Web Service**.
2. Connect your GitHub repository: `Shubhgoswami27/hms_console`.
3. Configure the following settings:
   - **Name**: `hms-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in the service settings:
   - `PORT`: `5000` (or leave default, Render sets this automatically)
   - `DATABASE_URL`: *(Your production PostgreSQL connection string from step 1)*
   - `JWT_SECRET`: *(A secure secret string for signing JWT tokens)*
5. Click **Deploy Web Service**.
6. Once deployed, note down your backend URL (e.g. `https://hms-backend.onrender.com`).

---

## 3. Deploy the Database Schema & Seed Data

Once the backend environment is ready with the `DATABASE_URL` pointing to your cloud PostgreSQL database, run these commands locally inside the `backend` folder to create the tables and seed default users:

```bash
# Navigate to backend directory
cd backend

# Temporarily set your cloud database URL in your shell, or update backend/.env
# Update the DATABASE_URL in backend/prisma/schema.prisma from "sqlite" to "postgresql" (see note below)

# Push the database schema
npx prisma db push

# Seed the database
npm run prisma:seed
```

> **Note on Prisma Database Provider**: 
> Before pushing the schema to PostgreSQL, you need to change the database provider inside `backend/prisma/schema.prisma` from `sqlite` to `postgresql` at the top:
> ```prisma
> datasource db {
>   provider = "postgresql"
>   url      = env("DATABASE_URL")
> }
> ```

---

## 4. Deploy the Frontend (Next.js)

You can host the Next.js frontend on [Vercel](https://vercel.com/) (free and recommended).

### Steps for Vercel:
1. Log in to Vercel and click **Add New > Project**.
2. Import your GitHub repository: `Shubhgoswami27/hms_console`.
3. Configure the project:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Next.js`
4. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api` (The Render URL of your backend API)
   - `NEXT_PUBLIC_SOCKET_URL`: `https://your-backend.onrender.com` (The Render URL of your backend root)
5. Click **Deploy**.
6. Vercel will build and publish your Next.js application, providing a public web URL.
