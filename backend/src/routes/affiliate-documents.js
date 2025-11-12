const { Router } = require('express');
const multer = require('multer');
const { uploadDocument } = require('../controllers/affiliate-documents.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Configuración de multer para documentos (PDF, JPG, PNG)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WEBP) y PDF.'));
    }
  }
});

// Endpoint para subir documentos de afiliados
router.post('/upload', 
  requireAuth, 
  requireRole('affiliate', 'user'), 
  upload.single('document'), 
  uploadDocument
);

module.exports = router;