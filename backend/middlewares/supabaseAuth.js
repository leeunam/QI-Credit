const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

/**
 * Cliente JWKS para validar tokens Supabase
 */
const client = jwksClient({
  jwksUri: `${config.supabase.url}/auth/v1/.well-known/jwks.json`,
  requestHeaders: {}, // Opcional
  timeout: 30000, // Defaults to 30s
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  cache: true,
  cacheMaxEntries: 5, // Default value
  cacheMaxAge: 600000, // Default value (10 min)
});

/**
 * Cliente Supabase para validações adicionais
 */
const supabase =
  config.supabase.url && config.supabase.serviceRoleKey
    ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

/**
 * Função para obter a chave pública do JWKS
 * @param {Object} header - Header do JWT
 * @param {Function} callback - Callback function
 */
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('❌ Erro ao obter chave JWKS:', err.message);
      return callback(err);
    }

    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Middleware de autenticação JWT com Supabase
 * Valida tokens emitidos pelo Supabase Auth
 */
const authenticateSupabaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso obrigatório',
        code: 'MISSING_TOKEN',
      });
    }

    // Verificar token com JWKS
    jwt.verify(
      token,
      getKey,
      {
        audience: 'authenticated',
        issuer: config.supabase.url,
        algorithms: ['RS256'],
      },
      async (err, decoded) => {
        if (err) {
          console.error('❌ Erro na verificação do token:', err.message);
          return res.status(403).json({
            error: 'Token inválido ou expirado',
            code: 'INVALID_TOKEN',
            details:
              process.env.NODE_ENV === 'development' ? err.message : undefined,
          });
        }

        try {
          // Validações adicionais do token
          if (!decoded.sub || !decoded.email) {
            return res.status(403).json({
              error: 'Token incompleto',
              code: 'INCOMPLETE_TOKEN',
            });
          }

          // Verificar se o usuário ainda existe no Supabase (opcional)
          if (supabase) {
            const { data: user, error } = await supabase.auth.admin.getUserById(
              decoded.sub
            );

            if (error || !user) {
              return res.status(403).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND',
              });
            }

            // Verificar se o usuário não foi banido/desabilitado
            if (user.user.banned_until || user.user.deleted_at) {
              return res.status(403).json({
                error: 'Usuário desabilitado',
                code: 'USER_DISABLED',
              });
            }
          }

          // Adicionar informações do usuário à requisição
          req.user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role || 'user',
            aud: decoded.aud,
            exp: decoded.exp,
            iat: decoded.iat,
            // Metadados adicionais do Supabase
            app_metadata: decoded.app_metadata || {},
            user_metadata: decoded.user_metadata || {},
          };

          next();
        } catch (validationError) {
          console.error(
            '❌ Erro na validação adicional:',
            validationError.message
          );
          return res.status(500).json({
            error: 'Erro interno na validação',
            code: 'VALIDATION_ERROR',
          });
        }
      }
    );
  } catch (error) {
    console.error('❌ Erro geral na autenticação:', error.message);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Middleware de autenticação para administradores
 */
const authenticateAdmin = async (req, res, next) => {
  authenticateSupabaseToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    // Verificar se o usuário tem role de admin
    const isAdmin =
      req.user.role === 'admin' ||
      req.user.app_metadata?.role === 'admin' ||
      req.user.app_metadata?.roles?.includes('admin');

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Acesso de administrador necessário',
        code: 'ADMIN_ACCESS_REQUIRED',
      });
    }

    next();
  });
};

/**
 * Middleware de autenticação opcional
 * Não falha se não houver token, mas popula req.user se houver
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  // Usar o mesmo processo de validação, mas sem retornar erro
  jwt.verify(
    token,
    getKey,
    {
      audience: 'authenticated',
      issuer: config.supabase.url,
      algorithms: ['RS256'],
    },
    async (err, decoded) => {
      if (err) {
        console.warn('⚠️ Token opcional inválido:', err.message);
        req.user = null;
      } else {
        req.user = {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role || 'user',
          app_metadata: decoded.app_metadata || {},
          user_metadata: decoded.user_metadata || {},
        };
      }
      next();
    }
  );
};

/**
 * Middleware para validar API Key (para serviços internos)
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.INTERNAL_API_KEY;

  if (!apiKey || !validApiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'API Key válida necessária',
      code: 'INVALID_API_KEY',
    });
  }

  // Marcar como requisição de serviço interno
  req.isInternalService = true;
  next();
};

/**
 * Middleware para validar propriedade de recurso
 * Verifica se o usuário pode acessar um recurso específico
 */
const validateResourceOwnership = (
  resourceIdParam = 'id',
  userIdField = 'user_id'
) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticação necessária',
        code: 'AUTHENTICATION_REQUIRED',
      });
    }

    // Admin pode acessar qualquer recurso
    const isAdmin =
      req.user.role === 'admin' || req.user.app_metadata?.role === 'admin';

    if (isAdmin) {
      return next();
    }

    // Para outros usuários, implementar lógica de validação
    // Esta é uma implementação básica - você pode expandir conforme necessário
    const resourceUserId = req.body[userIdField] || req.params[userIdField];

    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado ao recurso',
        code: 'RESOURCE_ACCESS_DENIED',
      });
    }

    next();
  };
};

/**
 * Função utilitária para gerar tokens de sessão customizados
 * (para casos onde você precisa de tokens adicionais)
 */
const generateCustomToken = (payload, expiresIn = '1h') => {
  try {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
  } catch (error) {
    console.error('❌ Erro ao gerar token customizado:', error.message);
    return null;
  }
};

/**
 * Função utilitária para validar tokens customizados
 */
const validateCustomToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error('❌ Erro ao validar token customizado:', error.message);
    return null;
  }
};

module.exports = {
  // Middlewares principais
  authenticateSupabaseToken,
  authenticateAdmin,
  optionalAuth,
  authenticateApiKey,
  validateResourceOwnership,

  // Utilitários
  generateCustomToken,
  validateCustomToken,

  // Para compatibilidade com código existente
  authenticateToken: authenticateSupabaseToken,
};
