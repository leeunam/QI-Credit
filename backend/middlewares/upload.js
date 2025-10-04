const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Tipos permitidos por bucket
    const allowedTypes = {
      documents: ['image/jpeg', 'image/png', 'application/pdf'],
      contracts: ['application/pdf'],
      kyc: ['image/jpeg', 'image/png'],
    };

    const bucket = req.body.bucket || 'documents';
    const allowed = allowedTypes[bucket] || allowedTypes.documents;

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Tipo de arquivo não permitido para o bucket ${bucket}. Tipos aceitos: ${allowed.join(
            ', '
          )}`
        ),
        false
      );
    }
  },
});

module.exports = upload;
