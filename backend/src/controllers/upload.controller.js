const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');
const crypto = require('crypto');
const path = require('path');

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

/**
 * Upload a single file to S3
 * POST /api/upload
 * Body: multipart/form-data with field "file"
 * Optional query: ?folder=avatars (defaults to "uploads")
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const folder = req.query.folder || 'uploads';
    const ext = path.extname(req.file.originalname);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    res.json({
      url,
      key,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

/**
 * Upload multiple files to S3
 * POST /api/upload/multiple
 * Body: multipart/form-data with field "files" (up to 10)
 */
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files provided' });
    }

    const folder = req.query.folder || 'uploads';
    const results = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname);
      const key = `${folder}/${crypto.randomUUID()}${ext}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
      results.push({
        url,
        key,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });
    }

    res.json({ files: results });
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

/**
 * Delete a file from S3
 * DELETE /api/upload
 * Body: { key: "uploads/abc123.jpg" }
 */
exports.deleteFile = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ message: 'File key is required' });
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('S3 delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
