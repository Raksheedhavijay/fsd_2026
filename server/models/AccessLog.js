const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  fileId:    { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  ip:        { type: String },
  userAgent: { type: String },
  success:   { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AccessLog', accessLogSchema);
