# ARX IT CLUB OF SJS - Database & Hosting Guide for Your Friend

This guide accompanies `arx_database.json` to help you host and run the backend & database for the ARX IT CLUB OF SJS platform.

---

## 1. What is inside `arx_database.json`?
This file contains the complete initial data for the platform:
- **`settings`**: Club configuration, official contacts, Telegram bot & channel links, meeting schedule, and brand assets.
- **`members`**: Member accounts, including the initial Administrator account (`admin@arxitclub.org`).
- **`courses`**: The 5 official technology tracks (Web Development, Python, Robotics, Cybersecurity, AI).
- **`media`**: Pre-configured media library assets (banners, logos, stamps).
- **`attendanceSessionConfigs`**: Time configs for club sessions.
- **`governance` & `socialLinks`**: Executive leadership structure and official social channels.

---

## 2. Options to Host the Database

### Option A: Free MongoDB Atlas (Recommended for NoSQL)
Because the data in `arx_database.json` is formatted as clean JSON collections:
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) (M0 Free Tier - 512 MB).
2. Create a cluster named `arx-cluster` and a database named `arx_db`.
3. In MongoDB Compass or the Atlas web UI, import each key from `arx_database.json` into its own collection (`members`, `courses`, `media`, `settings`, etc.).
4. In your `.env` file, set:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/arx_db
   ```

---

### Option B: Free Supabase (PostgreSQL with Visual Dashboard)
If you prefer a relational SQL database with real-time features and a web dashboard:
1. Sign up at [supabase.com](https://supabase.com) and create a free project.
2. In the **Table Editor**, you can create tables for `members`, `courses`, `enrollments`, `projects`, etc.
3. In your `.env` file, set:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

---

### Option C: Standalone Backend Hosting (Render / Railway / VPS)
If you want to host the full Node.js / Express backend with continuous in-memory or SQLite storage:
1. Push the code repository to GitHub.
2. Link it to [Render.com](https://render.com) or [Railway.app](https://railway.app).
3. Set the start command to:
   ```bash
   node server.js
   ```
4. Add the required environment variables:
   ```env
   JWT_SECRET=your_super_secret_jwt_key
   TELEGRAM_WEBHOOK_SECRET=your_telegram_webhook_secret
   PORT=3000
   ```
