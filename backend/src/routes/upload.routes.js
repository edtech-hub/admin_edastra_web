const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { uploadFile, uploadMultiple, deleteFile } = require('../controllers/upload.controller');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// All upload routes require authentication
router.post('/', auth, upload.single('file'), uploadFile);
router.post('/multiple', auth, upload.array('files', 10), uploadMultiple);
router.delete('/', auth, deleteFile);

module.exports = router;
