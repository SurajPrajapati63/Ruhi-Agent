const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  uploadFileHandler,
  uploadImageHandler,
  uploadAudioHandler,
  getUploadHistory,
  deleteUpload,
} = require('../controllers/uploadController');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  cb(null, allowedTypes.includes(file.mimetype));
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  cb(null, allowedTypes.includes(file.mimetype));
};

const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 30 * 1024 * 1024 },
});

const audioFilter = (req, file, cb) => {
  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/ogg'];
  cb(null, allowed.includes(file.mimetype));
};

const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const router = express.Router();

router.post('/file', authMiddleware, uploadFile.single('file'), uploadFileHandler);
router.post('/image', authMiddleware, uploadImage.single('image'), uploadImageHandler);
router.post('/audio', authMiddleware, uploadAudio.single('audio'), uploadAudioHandler);
router.get('/history', authMiddleware, getUploadHistory);
router.delete('/:id', authMiddleware, deleteUpload);

module.exports = router;
