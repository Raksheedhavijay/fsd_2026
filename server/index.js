require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./utils/db');
const { getLanIP } = require('./utils/getIP');

const app = express();
app.set('trust proxy',1);
connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/file-access', require('./routes/fileAccess'));
app.use('/api/history', require('./routes/history'));
app.use('/api/qr', require('./routes/qr'));

app.get('/', (req, res) => res.json({ status: 'Secure QR API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  const ip = getLanIP();
  console.log(`\n Server running on port ${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${ip}:${PORT}\n`);
});
