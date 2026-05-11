# 🔐 Secure QR File Sharing System

A full-stack MERN application for securely sharing files via password-protected QR codes.


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
