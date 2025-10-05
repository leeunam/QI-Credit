const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const db = require('../config/database');

/**
 * Serviço de Autenticação integrado com Supabase Auth
 */
class AuthService {
  constructor() {
    // Cliente para operações administrativas
    this.supabaseAdmin =
      config.supabase.url && config.supabase.serviceRoleKey
        ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          })
        : null;

    // Cliente público para operações de usuário
    this.supabasePublic =
      config.supabase.url && config.supabase.anonKey
        ? createClient(config.supabase.url, config.supabase.anonKey)
        : null;
  }

  /**
   * Registrar novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {Object} metadata - Metadados adicionais
   * @returns {Object} Resultado da operação
   */
  async registerUser(email, password, metadata = {}) {
    try {
      if (!this.supabaseAdmin) {
        throw new Error('Supabase não configurado');
      }

      // Registrar usuário no Supabase Auth
      const { data: authData, error: authError } =
        await this.supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirmar em desenvolvimento
          user_metadata: {
            full_name: metadata.full_name || '',
            phone: metadata.phone || '',
            ...metadata,
          },
          app_metadata: {
            role: metadata.role || 'user',
            created_at: new Date().toISOString(),
          },
        });

      if (authError) {
        throw authError;
      }

      // Criar registro na tabela users local (se existir)
      try {
        const userRecord = {
          id: authData.user.id,
          document: metadata.document || 'temp-doc',
          name: metadata.full_name || metadata.name || 'Usuário Teste',
          email: authData.user.email,
          phone: metadata.phone || null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        await db('users').insert(userRecord).onConflict('id').merge();
      } catch (dbError) {
        console.warn(
          '⚠️ Erro ao criar registro local do usuário:',
          dbError.message
        );
        // Não falhar por erro no banco local
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          metadata: authData.user.user_metadata,
          role: authData.user.app_metadata?.role || 'user',
        },
      };
    } catch (error) {
      console.error('❌ Erro no registro:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Fazer login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object} Resultado da operação com tokens
   */
  async loginUser(email, password) {
    try {
      if (!this.supabasePublic) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await this.supabasePublic.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (error) {
        throw error;
      }

      // Atualizar último login na tabela local
      try {
        await db('users').where('id', data.user.id).update({
          updated_at: new Date(),
        });
      } catch (dbError) {
        console.warn('⚠️ Erro ao atualizar último login:', dbError.message);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata,
          role: data.user.app_metadata?.role || 'user',
        },
        tokens: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      };
    } catch (error) {
      console.error('❌ Erro no login:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Refresh do token de acesso
   * @param {string} refreshToken - Token de refresh
   * @returns {Object} Novos tokens
   */
  async refreshToken(refreshToken) {
    try {
      if (!this.supabasePublic) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await this.supabasePublic.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        tokens: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      };
    } catch (error) {
      console.error('❌ Erro no refresh token:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Obter informações do usuário pelo ID
   * @param {string} userId - ID do usuário
   * @returns {Object} Informações do usuário
   */
  async getUserById(userId) {
    try {
      if (!this.supabaseAdmin) {
        throw new Error('Supabase não configurado');
      }

      const { data, error } = await this.supabaseAdmin.auth.admin.getUserById(
        userId
      );

      if (error) {
        throw error;
      }

      // Buscar dados adicionais na tabela local
      let localUserData = null;
      try {
        localUserData = await db('users').where('id', userId).first();
      } catch (dbError) {
        console.warn('⚠️ Erro ao buscar dados locais:', dbError.message);
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata,
          role: data.user.app_metadata?.role || 'user',
          created_at: data.user.created_at,
          email_verified: data.user.email_confirmed_at !== null,
          // Dados locais se disponíveis
          ...(localUserData && {
            full_name: localUserData.full_name,
            phone: localUserData.phone,
            last_login: localUserData.last_login,
          }),
        },
      };
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Atualizar perfil do usuário
   * @param {string} userId - ID do usuário
   * @param {Object} updates - Atualizações a serem feitas
   * @returns {Object} Resultado da operação
   */
  async updateUserProfile(userId, updates) {
    try {
      if (!this.supabaseAdmin) {
        throw new Error('Supabase não configurado');
      }

      // Separar atualizações entre metadata e dados administrativos
      const userMetadataUpdates = {};
      const appMetadataUpdates = {};
      const localUpdates = {};

      Object.keys(updates).forEach((key) => {
        if (['role'].includes(key)) {
          appMetadataUpdates[key] = updates[key];
        } else if (['full_name', 'phone', 'avatar_url'].includes(key)) {
          userMetadataUpdates[key] = updates[key];
          localUpdates[key] = updates[key];
        } else {
          localUpdates[key] = updates[key];
        }
      });

      // Atualizar no Supabase Auth se houver metadados
      if (
        Object.keys(userMetadataUpdates).length > 0 ||
        Object.keys(appMetadataUpdates).length > 0
      ) {
        const { data, error } =
          await this.supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: userMetadataUpdates,
            app_metadata: appMetadataUpdates,
          });

        if (error) {
          throw error;
        }
      }

      // Atualizar na tabela local
      try {
        if (Object.keys(localUpdates).length > 0) {
          await db('users')
            .where('id', userId)
            .update({
              ...localUpdates,
              updated_at: new Date(),
            });
        }
      } catch (dbError) {
        console.warn('⚠️ Erro ao atualizar dados locais:', dbError.message);
      }

      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Resetar senha do usuário
   * @param {string} email - Email do usuário
   * @returns {Object} Resultado da operação
   */
  async resetPassword(email) {
    try {
      if (!this.supabasePublic) {
        throw new Error('Supabase não configurado');
      }

      const { error } = await this.supabasePublic.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        }
      );

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Email de reset enviado',
      };
    } catch (error) {
      console.error('❌ Erro no reset de senha:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Deletar usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado da operação
   */
  async deleteUser(userId) {
    try {
      if (!this.supabaseAdmin) {
        throw new Error('Supabase não configurado');
      }

      // Deletar do Supabase Auth
      const { error } = await this.supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        throw error;
      }

      // Marcar como deletado na tabela local (soft delete)
      try {
        await db('users').where('id', userId).update({
          deleted_at: new Date(),
          updated_at: new Date(),
        });
      } catch (dbError) {
        console.warn(
          '⚠️ Erro ao marcar usuário como deletado:',
          dbError.message
        );
      }

      return {
        success: true,
        message: 'Usuário deletado com sucesso',
      };
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Listar usuários (admin only)
   * @param {Object} options - Opções de listagem
   * @returns {Object} Lista de usuários
   */
  async listUsers(options = {}) {
    try {
      if (!this.supabaseAdmin) {
        throw new Error('Supabase não configurado');
      }

      const { page = 1, perPage = 1000 } = options;

      const { data, error } = await this.supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        users: data.users.map((user) => ({
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
          role: user.app_metadata?.role || 'user',
          created_at: user.created_at,
          email_verified: user.email_confirmed_at !== null,
          last_sign_in: user.last_sign_in_at,
        })),
        pagination: {
          page,
          perPage,
          total: data.total || data.users.length,
        },
      };
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }
}

module.exports = new AuthService();
