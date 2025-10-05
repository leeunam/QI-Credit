const authService = require('../services/authService');
const { validationResult } = require('express-validator');

/**
 * Controlador de Autenticação
 */
class AuthController {
  /**
   * Registrar novo usuário
   */
  async register(req, res) {
    try {
      // Verificar erros de validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array(),
        });
      }

      const { email, password, full_name, phone, role } = req.body;

      // Validações básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios',
          code: 'MISSING_REQUIRED_FIELDS',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Senha deve ter pelo menos 6 caracteres',
          code: 'WEAK_PASSWORD',
        });
      }

      // Chamar serviço de autenticação
      const result = await authService.registerUser(email, password, {
        full_name,
        phone,
        role: role || 'user',
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Fazer login automático após registro bem-sucedido para obter tokens
      const loginResult = await authService.loginUser(email, password);

      if (!loginResult.success) {
        // Registro foi bem-sucedido, mas login falhou
        return res.status(201).json({
          success: true,
          message: 'Usuário registrado com sucesso. Por favor, faça login.',
          data: {
            user: result.user,
            tokens: null
          },
        });
      }

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: {
          user: loginResult.user,
          tokens: {
            accessToken: loginResult.tokens.access_token,
            refreshToken: loginResult.tokens.refresh_token,
            expiresAt: loginResult.tokens.expires_at,
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro no registro:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Login do usuário
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios',
          code: 'MISSING_CREDENTIALS',
        });
      }

      const result = await authService.loginUser(email, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: result.user,
          tokens: {
            accessToken: result.tokens.access_token,
            refreshToken: result.tokens.refresh_token,
            expiresAt: result.tokens.expires_at,
          },
        },
      });
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório',
          code: 'MISSING_REFRESH_TOKEN',
        });
      }

      const result = await authService.refreshToken(refresh_token);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        tokens: result.tokens,
      });
    } catch (error) {
      console.error('❌ Erro no refresh token:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Obter perfil do usuário autenticado
   */
  async getProfile(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED',
        });
      }

      const result = await authService.getUserById(req.user.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json({
        success: true,
        data: result.user,
      });
    } catch (error) {
      console.error('❌ Erro ao obter perfil:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED',
        });
      }

      const { full_name, phone } = req.body;
      const updates = {};

      if (full_name !== undefined) updates.full_name = full_name;
      if (phone !== undefined) updates.phone = phone;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma atualização fornecida',
          code: 'NO_UPDATES',
        });
      }

      const result = await authService.updateUserProfile(req.user.id, updates);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: result.user,
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Reset de senha
   */
  async resetPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email é obrigatório',
          code: 'MISSING_EMAIL',
        });
      }

      const result = await authService.resetPassword(email);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Email de reset enviado, verifique sua caixa de entrada',
      });
    } catch (error) {
      console.error('❌ Erro no reset de senha:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Listar usuários (admin only)
   */
  async listUsers(req, res) {
    try {
      const { page = 1, perPage = 50 } = req.query;

      const result = await authService.listUsers({
        page: parseInt(page),
        perPage: parseInt(perPage),
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        users: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Obter usuário por ID (admin only)
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório',
          code: 'MISSING_USER_ID',
        });
      }

      const result = await authService.getUserById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json({
        success: true,
        user: result.user,
      });
    } catch (error) {
      console.error('❌ Erro ao obter usuário:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Atualizar usuário (admin only)
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { full_name, phone, role } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório',
          code: 'MISSING_USER_ID',
        });
      }

      const updates = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (phone !== undefined) updates.phone = phone;
      if (role !== undefined) updates.role = role;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Nenhuma atualização fornecida',
          code: 'NO_UPDATES',
        });
      }

      const result = await authService.updateUserProfile(id, updates);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Deletar usuário (admin only)
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID do usuário é obrigatório',
          code: 'MISSING_USER_ID',
        });
      }

      // Prevenir auto-exclusão
      if (req.user && req.user.id === id) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível deletar sua própria conta',
          code: 'CANNOT_DELETE_SELF',
        });
      }

      const result = await authService.deleteUser(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso',
      });
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * Verificar status de autenticação
   */
  async status(req, res) {
    try {
      if (!req.user) {
        return res.json({
          authenticated: false,
          user: null,
        });
      }

      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          metadata: req.user.user_metadata,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}

module.exports = new AuthController();
