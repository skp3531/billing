# SETUP.md — Setup Guide

## Prerequisites

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v18 | v20.14+ |
| npm | v9 | v10.7+ |
| MongoDB | Atlas account | Atlas M0 (free) |
| OS | macOS/Linux/Windows | macOS/Linux |

---

## Step 1: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new cluster (M0 Free tier is sufficient)
3. Create a database user:
   - Go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Note the username and password
4. Allow network access:
   - Go to **Network Access** → **Add IP Address**
   - For development: Add your current IP or `0.0.0.0/0` (allow all)
5. Get the connection string:
   - Go to **Clusters** → **Connect** → **Connect your application**
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<username>` and `<password>` with your credentials
   - Add the database name: `pos_db` before the `?`
   - Final format: `mongodb+srv://username:password@cluster0.xxx.mongodb.net/pos_db?retryWrites=true&w=majority`

---

## Step 2: Backend Environment Setup

```bash
cd "/Volumes/Personal/antigravity app/billing app/server"
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/pos_db?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your-super-secret-access-key-at-least-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> 💡 Generate secure secrets:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Step 3: Frontend Environment Setup

```bash
cd "/Volumes/Personal/antigravity app/billing app/client"
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 4: Install Dependencies

```bash
# Backend
cd "/Volumes/Personal/antigravity app/billing app/server"
npm install

# Frontend
cd "/Volumes/Personal/antigravity app/billing app/client"
npm install
```

---

## Step 5: Seed Database

```bash
cd "/Volumes/Personal/antigravity app/billing app/server"
npm run seed
```

Expected output:
```
🌱 Starting database seed...
✅ Connected to MongoDB
⚠️  Creating organization: Shake Sphere
✅ Organization created: Shake Sphere
⚠️  Creating outlet: Main Outlet
✅ Outlet created: Main Outlet
⚠️  Creating roles...
✅ Roles created: OWNER, MANAGER, CASHIER, WAITER, KITCHEN, INVENTORY_MANAGER, ACCOUNTANT
⚠️  Creating users...
✅ User created: Sanjay Kumar (OWNER)
✅ User created: Rahul Sharma (MANAGER)
✅ User created: Priya Das (CASHIER)
✅ User created: Ravi Kumar (KITCHEN)
✅ Seed complete!
📦 Disconnected from MongoDB
```

The seed is **idempotent** — safe to run multiple times.

---

## Step 6: Start the Servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd "/Volumes/Personal/antigravity app/billing app/server"
npm run dev
```

Expected:
```
[RestoPOS] Server running on port 5000
[RestoPOS] Connected to MongoDB Atlas ✓
```

**Terminal 2 — Frontend:**
```bash
cd "/Volumes/Personal/antigravity app/billing app/client"
npm run dev
```

Expected:
```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 7: Verify Installation

1. Open http://localhost:5173 in your browser
2. You should see the login page
3. Log in with: `owner@shakesphere.com` / `Owner@123`
4. You should be redirected to the dashboard

---

## Development Seed Credentials

| Role    | Email                        | Password    | Access Level |
|---------|------------------------------|-------------|-------------|
| Owner   | owner@shakesphere.com        | Owner@123   | Full access |
| Manager | manager@shakesphere.com      | Manager@123 | Ops access |
| Cashier | cashier@shakesphere.com      | Cashier@123 | POS + cash |
| Kitchen | kitchen@shakesphere.com      | Kitchen@123 | Kitchen only |

> ⚠️ **IMPORTANT**: These are development credentials only. Change all passwords before any production use.

---

## Troubleshooting

### "MongoServerError: bad auth"
- Double check your MongoDB Atlas username and password in `.env`
- Make sure you've URL-encoded special characters in the password

### "Network Access" / connection timeout
- Go to MongoDB Atlas → Network Access → Add your IP address
- Or temporarily allow all: `0.0.0.0/0`

### "Port 5000 already in use"
```bash
lsof -ti:5000 | xargs kill -9
```

### Frontend shows blank page
- Check browser console for errors
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in client `.env`

### TypeScript errors
```bash
# Backend
cd server && npx tsc --noEmit

# Frontend
cd client && npx tsc --noEmit
```

---

## Production Deployment Notes

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd client && npm run build`
3. Serve `client/dist` as static files from the backend or a CDN
4. Use strong, randomly generated JWT secrets
5. Use a dedicated MongoDB Atlas cluster (M10+ for production)
6. Enable MongoDB Atlas IP whitelist to only your server IP
7. Set up SSL/TLS for the API (use nginx or a reverse proxy)
