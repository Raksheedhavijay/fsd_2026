# 🔐 Secure QR File Sharing System

A full-stack MERN application for securely sharing files via password-protected QR codes.

---

## 📁 Project Structure

```
FSD_secure_qr/
├── server/                  # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/             # Uploaded files stored here
│   ├── index.js
│   └── .env
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── utils/
│   └── public/
└── postman_collection.json
```

---

## 🗄️ Step-by-Step: Connect MongoDB Database

### Option A — Local MongoDB

1. **Install MongoDB Community Edition**
   - Ubuntu/Debian:
     ```bash
     sudo apt update
     sudo apt install -y mongodb
     sudo systemctl start mongodb
     sudo systemctl enable mongodb
     ```
   - macOS (Homebrew):
     ```bash
     brew tap mongodb/brew
     brew install mongodb-community
     brew services start mongodb-community
     ```
   - Windows: Download from https://www.mongodb.com/try/download/community

2. **Verify MongoDB is running**
   ```bash
   mongosh
   # You should see the MongoDB shell prompt
   ```

3. **Set the connection string in `server/.env`**
   ```
   MONGO_URI=mongodb://localhost:27017/secure_qr_db
   ```
   The database `secure_qr_db` will be created automatically on first run.

### Option B — MongoDB Atlas (Cloud, Free Tier)

1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a new **Free Cluster** (M0)
3. Under **Database Access** → Add a new user with username/password
4. Under **Network Access** → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)
5. Click **Connect** → **Connect your application** → Copy the connection string
6. Replace in `server/.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/secure_qr_db?retryWrites=true&w=majority
   ```

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js v18+ → https://nodejs.org
- npm v9+
- MongoDB (local or Atlas)

---

### Step 1 — Clone / Navigate to project
```bash
cd /home/radha/Desktop/FSD_secure_qr
```

### Step 2 — Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3 — Configure Backend Environment
Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/secure_qr_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
AES_SECRET_KEY=your_32_char_aes_secret_key_here!
CLIENT_URL=http://localhost:3000
```
> ⚠️ Change `JWT_SECRET` and `AES_SECRET_KEY` to strong random strings in production.

### Step 4 — Start the Backend Server
```bash
# In the server/ directory
npm run dev
# Server starts at http://localhost:5000
```

### Step 5 — Install Frontend Dependencies
Open a **new terminal**:
```bash
cd /home/radha/Desktop/FSD_secure_qr/client
npm install
```

### Step 6 — Start the Frontend
```bash
npm start
# React app opens at http://localhost:3000
```

---

## ✅ Verify Everything Works

1. Open http://localhost:3000 → You should see the Login page
2. Click **Sign up** → Create an account
3. Login → You're on the Dashboard
4. Click **Upload** tab → Select a file, set a password → Upload
5. A QR code is generated — click **View QR**
6. Scan the QR with your phone OR click **Copy Link**
7. Open the link → Enter the password → File downloads/previews

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs (12 rounds) |
| File password encryption | AES-256-CBC (crypto module) |
| Auth tokens | JWT (7 day expiry) |
| Rate limiting | 100 req / 15 min |
| Input validation | express-validator |
| File type filtering | Multer file filter |
| One-time access | Flag in DB, checked on verify |
| Link expiry | Timestamp comparison |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/upload | Yes | Upload file + generate QR |
| GET | /api/upload/my-files | Yes | Get user's files |
| DELETE | /api/upload/:id | Yes | Delete file |
| GET | /api/file-access/:token | No | Get file info by token |
| POST | /api/file-access/:token/verify | No | Verify password |
| GET | /api/history | Yes | Get access logs |
| GET | /api/qr/:token | Yes | Get QR code |

---

## 🌐 Deployment

### Backend → Render
1. Push `server/` to GitHub
2. Create new Web Service on https://render.com
3. Set environment variables from `.env`
4. Build command: `npm install` | Start command: `npm start`

### Frontend → Vercel
1. Push `client/` to GitHub
2. Import on https://vercel.com
3. Set env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com`
4. Update `client/src/utils/api.js` baseURL to use `process.env.REACT_APP_API_URL`

---

## 🧪 Postman Testing

Import `postman_collection.json` into Postman:
1. Open Postman → Import → Upload `postman_collection.json`
2. Set collection variable `token` after login
3. Test all endpoints in order: Signup → Login → Upload → Verify
