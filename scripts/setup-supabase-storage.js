#!/usr/bin/env node

/**
 * Script para configurar buckets do Supabase Storage
 * Cria buckets organizados por tipo de documento
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  setup: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
};

const BUCKETS_CONFIG = [
  {
    name: 'user-profiles',
    description: 'Fotos de perfil dos usuários',
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  },
  {
    name: 'kyc-documents',
    description: 'Documentos de KYC (RG, CPF, CNH, etc.)',
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
  },
  {
    name: 'loan-documents',
    description: 'Documentos relacionados a empréstimos',
    public: false,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    fileSizeLimit: 15 * 1024 * 1024, // 15MB
  },
  {
    name: 'credit-analysis',
    description: 'Documentos de análise de crédito',
    public: false,
    allowedMimeTypes: ['application/pdf', 'text/csv', 'application/json'],
    fileSizeLimit: 20 * 1024 * 1024, // 20MB
  },
  {
    name: 'audit-files',
    description: 'Arquivos de auditoria e logs',
    public: false,
    allowedMimeTypes: ['application/json', 'text/plain', 'text/csv'],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
  },
  {
    name: 'temporary-files',
    description: 'Arquivos temporários (auto-cleanup)',
    public: false,
    allowedMimeTypes: ['*/*'],
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
  },
];

async function setupSupabaseStorage() {
  log.setup('Configurando Supabase Storage...');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log.error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados');
    return false;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // Listar buckets existentes
    const { data: existingBuckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    log.info(
      `Buckets existentes: ${existingBuckets.map((b) => b.name).join(', ')}`
    );

    // Criar buckets necessários
    let createdCount = 0;
    let skippedCount = 0;

    for (const bucketConfig of BUCKETS_CONFIG) {
      const bucketExists = existingBuckets.find(
        (b) => b.name === bucketConfig.name
      );

      if (bucketExists) {
        log.info(`Bucket '${bucketConfig.name}' já existe`);
        skippedCount++;
        continue;
      }

      log.setup(`Criando bucket '${bucketConfig.name}'...`);

      const { error: createError } = await supabase.storage.createBucket(
        bucketConfig.name,
        {
          public: bucketConfig.public,
          allowedMimeTypes: bucketConfig.allowedMimeTypes,
          fileSizeLimit: bucketConfig.fileSizeLimit,
        }
      );

      if (createError) {
        if (createError.message.includes('already exists')) {
          log.warning(`Bucket '${bucketConfig.name}' já existe`);
          skippedCount++;
        } else {
          log.error(
            `Erro ao criar bucket '${bucketConfig.name}': ${createError.message}`
          );
          continue;
        }
      } else {
        log.success(`Bucket '${bucketConfig.name}' criado com sucesso`);
        createdCount++;
      }
    }

    // Resumo
    console.log('\n' + '='.repeat(50));
    log.success(`Configuração concluída:`);
    log.info(`✨ Buckets criados: ${createdCount}`);
    log.info(`📁 Buckets existentes: ${skippedCount}`);
    log.info(`📊 Total de buckets: ${createdCount + skippedCount}`);

    // Listar buckets finais
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    console.log('\n' + colors.cyan + '📋 Buckets disponíveis:' + colors.reset);
    finalBuckets.forEach((bucket) => {
      const config = BUCKETS_CONFIG.find((c) => c.name === bucket.name);
      const description = config ? ` - ${config.description}` : '';
      console.log(`  📁 ${bucket.name}${description}`);
    });

    return true;
  } catch (error) {
    log.error(`Erro na configuração: ${error.message}`);
    return false;
  }
}

// Função para testar upload em diferentes buckets
async function testBucketOperations() {
  log.setup('Testando operações em buckets...');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  const testFiles = [
    {
      bucket: 'user-profiles',
      fileName: 'test-profile.jpg',
      content: Buffer.from('fake-image-data'),
      contentType: 'image/jpeg',
    },
    {
      bucket: 'kyc-documents',
      fileName: 'test-document.pdf',
      content: Buffer.from('fake-pdf-data'),
      contentType: 'application/pdf',
    },
    {
      bucket: 'temporary-files',
      fileName: 'test-temp.txt',
      content: Buffer.from('temporary file content'),
      contentType: 'text/plain',
    },
  ];

  let successCount = 0;

  for (const testFile of testFiles) {
    try {
      // Upload
      const { data, error } = await supabase.storage
        .from(testFile.bucket)
        .upload(testFile.fileName, testFile.content, {
          contentType: testFile.contentType,
          metadata: {
            test: true,
            uploadedAt: new Date().toISOString(),
          },
        });

      if (error) {
        log.error(
          `Falha no upload para '${testFile.bucket}': ${error.message}`
        );
        continue;
      }

      log.success(
        `Upload bem-sucedido: ${testFile.bucket}/${testFile.fileName}`
      );

      // Criar URL assinada
      const { data: urlData, error: urlError } = await supabase.storage
        .from(testFile.bucket)
        .createSignedUrl(testFile.fileName, 3600);

      if (urlError) {
        log.warning(`Erro ao criar URL assinada: ${urlError.message}`);
      } else {
        log.info(`URL assinada criada para ${testFile.fileName}`);
      }

      // Limpar arquivo de teste
      await supabase.storage.from(testFile.bucket).remove([testFile.fileName]);
      log.info(`Arquivo de teste removido: ${testFile.fileName}`);

      successCount++;
    } catch (error) {
      log.error(
        `Erro no teste do bucket '${testFile.bucket}': ${error.message}`
      );
    }
  }

  console.log('\n' + '='.repeat(50));
  log.success(
    `Testes concluídos: ${successCount}/${testFiles.length} buckets funcionando`
  );

  return successCount === testFiles.length;
}

// Executar configuração se chamado diretamente
if (require.main === module) {
  const main = async () => {
    console.log(
      colors.magenta + '🚀 CONFIGURAÇÃO SUPABASE STORAGE' + colors.reset
    );
    console.log('='.repeat(50));

    const setupSuccess = await setupSupabaseStorage();

    if (setupSuccess) {
      console.log('\n' + '-'.repeat(50));
      await testBucketOperations();
    }

    console.log(
      '\n' + colors.blue + 'ℹ Configuração concluída!' + colors.reset
    );
  };

  main().catch((error) => {
    log.error(`Erro geral: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  setupSupabaseStorage,
  testBucketOperations,
  BUCKETS_CONFIG,
};
