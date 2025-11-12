const cloudinary = require('../utils/cloudinary');
const createError = require('http-errors');

async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      throw createError(400, 'No se ha proporcionado ningún documento');
    }

    const { documentType } = req.body; // 'dni', 'additional', 'terms'
    
    if (!documentType || !['dni', 'additional', 'terms'].includes(documentType)) {
      throw createError(400, 'Tipo de documento inválido. Debe ser: dni, additional, o terms');
    }

    // Validar configuración de Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw createError(500, 'Cloudinary no está configurado en el servidor');
    }

    // Subir a Cloudinary en la carpeta específica de documentos de afiliados (PDF/Imágenes)
    const baseFolder = process.env.CLOUDINARY_FOLDER || 'amazon_group';
    const folder = `${baseFolder}/affiliate-documents`;
    const resourceType = req.file.mimetype === 'application/pdf' ? 'raw' : 'image';
    const publicId = `${req.user.userId}_${documentType}_${Date.now()}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder,
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return reject(createError(500, 'Error al subir el documento'));
          }
          return resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      documentType,
      message: 'Documento subido exitosamente'
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDocument
};