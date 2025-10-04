const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const storageController = require('../controllers/storageController');

// Upload de arquivo
router.post('/upload', upload.single('file'), storageController.uploadFile);

// Gerar URL de download com token temporário
router.get('/download/:fileId', storageController.generateDownloadUrl);

// Listar arquivos (com filtros opcionais)
router.get('/files', storageController.listFiles);

// Deletar arquivo
router.delete('/files/:fileId', storageController.deleteFile);

// Health check
router.get('/health', storageController.healthCheck);

module.exports = router;
