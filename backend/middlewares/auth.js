const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

// Inicializar cliente Supabase para validação de tokens
const supabase =
  config.supabase.url && config.supabase.anonKey
    ? createClient(config.supabase.url, config.supabase.anonKey)
    : null;

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Primeiro tenta decodificar como JWT do Supabase
    const decoded = jwt.decode(token, { complete: true });

    if (decoded && decoded.payload) {
      // Token do Supabase - validação simples para testes
      if (decoded.payload.sub && decoded.payload.email) {
        req.user = {
          id: decoded.payload.sub,
          email: decoded.payload.email,
          role: decoded.payload.app_metadata?.role || 'user',
          metadata: decoded.payload.user_metadata || {},
        };
        return next();
      }
    }

    // Se não for JWT do Supabase, tenta validação local
    jwt.verify(token, config.JWT_SECRET || 'default_secret', (err, user) => {
      if (err) {
        console.error('❌ Erro na verificação do token:', err.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('❌ Erro na validação do token:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
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
  authenticateApiKey,
};
