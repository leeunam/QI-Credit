const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// API Key authentication middleware for internal services
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = config.INTERNAL_API_KEY;
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Valid API key required' });
  }
  
  next();
};

module.exports = {
  authenticateToken,
  authenticateAdmin,
  authenticateApiKey
};