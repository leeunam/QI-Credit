const { supabase } = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const {
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require('../constants');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
    }

    const { bucket = 'documents', folder = '', userId } = req.body;
    
    // Mapeamento de buckets abreviados para nomes reais no Supabase
    const bucketMap = {
      'documents': 'documents',
      'kyc': 'kyc-documents',
      'kyc-documents': 'kyc-documents',
      'user-profiles': 'user-profiles',
      'contracts': 'contracts',
      'loan-documents': 'loan-documents',
      'credit-analysis': 'credit-analysis',
      'audit-files': 'audit-files',
      'temporary-files': 'temporary-files'
    };

    // Use o nome real do bucket ou o mesmo se não estiver no mapeamento
    const realBucketName = bucketMap[bucket] || bucket;
    // Para validação, usar o bucket normalizado
    const bucketUpper = realBucketName.toUpperCase().replace('-', '_');

    // Validação de tamanho de arquivo
    const maxSize = FILE_SIZE_LIMITS[bucketUpper] || FILE_SIZE_LIMITS.DEFAULT;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: `${ERROR_MESSAGES.FILE_TOO_LARGE}. Tamanho máximo para bucket '${bucket}': ${Math.round(maxSize / 1024 / 1024)}MB`,
      });
    }

    // Validação de tipo MIME
    const allowedMimeTypes = ALLOWED_MIME_TYPES[bucketUpper];
    if (allowedMimeTypes && !allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `${ERROR_MESSAGES.INVALID_FILE_TYPE}. Tipos permitidos para bucket '${bucket}': ${allowedMimeTypes.join(', ')}`,
      });
    }

    // Validação de extensão de arquivo
    const fileExtension = req.file.originalname.toLowerCase().match(/\.[^.]*$/)?.[0];
    const allowedExtensions = ALLOWED_FILE_EXTENSIONS[bucketUpper];
    if (allowedExtensions && fileExtension && !allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        error: `${ERROR_MESSAGES.INVALID_FILE_EXTENSION}. Extensões permitidas para bucket '${bucket}': ${allowedExtensions.join(', ')}`,
      });
    }

    const fileId = uuidv4();
    const fileName = `${fileId}-${req.file.originalname}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    console.log('📤 Upload info:', {
      fileId,
      fileName,
      filePath,
      bucket: realBucketName,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Validar userId se fornecido
    if (userId) {
      try {
        const userExists = await db('users').where('id', userId).first();
        if (!userExists) {
          console.warn('⚠️  Usuário não encontrado:', userId);
          // Não bloquear o upload se o usuário não for encontrado, apenas logar o aviso
          // return res.status(404).json({
          //   success: false,
          //   error: 'Usuário não encontrado',
          // });
        }
      } catch (dbError) {
        console.warn('⚠️  Não foi possível validar usuário:', dbError.message);
      }
    }

    // Mock mode
    if (!supabase) {
      console.log('📁 Mock upload:', { fileName, bucket, size: req.file.size });

      // Salvar referência no banco mesmo em mock mode
      try {
        const fileRecord = {
          id: fileId,
          user_id: userId || null,
          bucket,
          file_path: filePath,
          file_name: fileName,
          original_name: req.file.originalname,
          mime_type: req.file.mimetype,
          file_size: req.file.size,
          is_public: false,
          created_at: new Date(),
          updated_at: new Date(),
        };

        await db('file_uploads').insert(fileRecord);
      } catch (dbError) {
        console.warn(
          '⚠️  Não foi possível salvar no banco (tabela pode não existir):',
          dbError.message
        );
      }

      return res.json({
        success: true,
        data: {
          fileId: fileId,
          path: filePath,
          fileName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          mockMode: true,
        },
      });
    }

    // Upload real para Supabase
    console.log('🚀 Uploading to Supabase bucket:', realBucketName);
    const { data, error } = await supabase.storage
      .from(realBucketName)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          userId: userId || null,
          uploadedAt: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error
      });
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Upload successful to Supabase:', data);

    // Salvar referência no banco
    try {
      const fileRecord = {
        id: fileId,
        user_id: userId || null,
        bucket: realBucketName, // Usar o nome real do bucket
        file_path: data.path,
        file_name: fileName,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await db('file_uploads').insert(fileRecord);
    } catch (dbError) {
      console.warn(
        '⚠️  Upload realizado mas não foi possível salvar no banco:',
        dbError.message
      );
    }

    res.json({
      success: true,
      data: {
        fileId,
        path: data.path,
        fileName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        bucket, // Manter o bucket original para compatibilidade com o frontend
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

exports.generateDownloadUrl = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { expiresIn = 3600 } = req.query; // 1 hora por padrão

    // Buscar arquivo no banco
    let fileRecord;
    try {
      fileRecord = await db('file_uploads').where('id', fileId).first();
    } catch (dbError) {
      console.warn('⚠️  Não foi possível consultar banco:', dbError.message);
    }

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado',
      });
    }

    // Mock mode
    if (!supabase) {
      return res.json({
        success: true,
        data: {
          downloadUrl: `http://localhost:3000/mock-download/${fileId}`,
          expiresAt: new Date(Date.now() + parseInt(expiresIn) * 1000),
          fileName: fileRecord.original_name,
          fileSize: fileRecord.file_size,
          mimeType: fileRecord.mime_type,
          mockMode: true,
        },
      });
    }

    // Gerar URL assinada
    const { data, error } = await supabase.storage
      .from(fileRecord.bucket)
      .createSignedUrl(fileRecord.file_path, parseInt(expiresIn));

    if (error) {
      console.error('❌ Signed URL error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: {
        downloadUrl: data.signedUrl,
        expiresAt: new Date(Date.now() + parseInt(expiresIn) * 1000),
        fileName: fileRecord.original_name,
        fileSize: fileRecord.file_size,
        mimeType: fileRecord.mime_type,
      },
    });
  } catch (error) {
    console.error('❌ Download URL error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const { bucket, userId } = req.query;

    let query = db('file_uploads');

    if (userId) {
      query = query.where('user_id', userId);
    }

    if (bucket) {
      query = query.where('bucket', bucket);
    }

    const files = await query
      .select(
        'id',
        'bucket',
        'original_name',
        'mime_type',
        'file_size',
        'is_public',
        'created_at'
      )
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: files,
      count: files.length,
    });
  } catch (error) {
    console.error('❌ List files error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Buscar arquivo no banco
    const fileRecord = await db('file_uploads').where('id', fileId).first();

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado',
      });
    }

    // Mock mode
    if (!supabase) {
      await db('file_uploads').where('id', fileId).del();
      return res.json({
        success: true,
        message: 'Arquivo deletado (mock mode)',
      });
    }

    // Deletar do Supabase
    const { error } = await supabase.storage
      .from(fileRecord.bucket)
      .remove([fileRecord.file_path]);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Deletar do banco
    await db('file_uploads').where('id', fileId).del();

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso',
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

exports.healthCheck = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {},
    };

    // Testar banco de dados
    try {
      await db.raw('SELECT 1');
      health.services.database = { status: 'connected', type: 'PostgreSQL' };
    } catch (dbError) {
      health.services.database = { status: 'error', error: dbError.message };
      health.status = 'degraded';
    }

    // Testar Supabase Storage
    if (supabase) {
      try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
          health.services.storage = { status: 'error', error: error.message };
          health.status = 'degraded';
        } else {
          health.services.storage = {
            status: 'connected',
            type: 'Supabase Storage',
            buckets: data.map((b) => b.name),
          };
        }
      } catch (storageError) {
        health.services.storage = {
          status: 'error',
          error: storageError.message,
        };
        health.status = 'degraded';
      }
    } else {
      health.services.storage = { status: 'mock', type: 'Mock Storage' };
    }

    const statusCode = health.status === 'ok' ? 200 : 500;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
