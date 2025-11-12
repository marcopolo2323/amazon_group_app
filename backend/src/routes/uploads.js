const { Router } = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const cloudinary = require('../utils/cloudinary');

const router = Router();

// Usamos memoryStorage para enviar el buffer a Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Tipo de archivo no permitido'));
    cb(null, true);
  },
});

router.post('/', requireAuth, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió imagen' });
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: 'Cloudinary no está configurado en el servidor' });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'amazon_group';
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, uploaded) => {
        if (err) return reject(err);
        return resolve(uploaded);
      });
      stream.end(req.file.buffer);
    });

    return res.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;