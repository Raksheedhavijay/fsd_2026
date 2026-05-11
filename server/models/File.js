const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename:          { type: String, required: true },
  originalName:      { type: String, required: true },
  filePath:          { type: String, required: true },
  fileSize:          { type: Number },
  mimeType:          { type: String },
  owner:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token:             { type: String, required: true, unique: true },
  encryptedPassword: { type: String, required: true },
  qrCode:            { type: String },
  expiresAt:         { type: Date, default: null },
  oneTimeAccess:     { type: Boolean, default: false },
  accessed:          { type: Boolean, default: false },
  scanCount:         { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
