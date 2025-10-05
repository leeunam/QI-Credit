const multer = require('multer');

// Multer configuration
// Note: File type validation is handled in the controller, not here,
// because req.body is not available during fileFilter execution
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max (individual validations in controller)
    files: 1,
  },
});

module.exports = upload;
