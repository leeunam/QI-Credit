const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');

// Redirecionar para o health check principal do storageController
router.get('/', storageController.healthCheck);

module.exports = router;
