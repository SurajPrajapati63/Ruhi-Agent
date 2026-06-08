const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  url: { type: String },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, enum: ['document', 'image', 'audio'], required: true },
  note: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
  extractedText: { type: String, default: '' },
  ocrText: { type: String, default: '' },
  analysis: {
    description: String,
    caption: String,
    objectDetection: String,
    summary: String,
  },
  vectorCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('File', fileSchema);
