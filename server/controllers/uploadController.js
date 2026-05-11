const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');
const File = require('../models/File');
const { encrypt } = require('../utils/crypto');
const { getServerBase } = require('../utils/getIP');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { password, expiresIn, oneTimeAccess } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const token = uuidv4();
    const base = getServerBase();
    const accessUrl = `${base}/api/file-access/${token}`;
    const qrCode = await QRCode.toDataURL(accessUrl, { width: 300, margin: 2 });
    const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 3600000) : null;

    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      owner: req.user.id,
      token,
      encryptedPassword: encrypt(password),
      qrCode,
      expiresAt,
      oneTimeAccess: oneTimeAccess === 'true',
    });

    res.status(201).json({ message: 'File uploaded successfully', file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserFiles = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath);
    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
