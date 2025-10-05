#!/usr/bin/env node

/**
 * QI Credit - Script para Criar Buckets no Supabase Storage
 *
 * Este script cria todos os buckets necessários para o sistema QI Credit.
 * Execute: node scripts/create-buckets.js
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// CONFIGURAÇÕES E HELPERS
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(70)}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.magenta}📋 ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// ============================================================================
// CONFIGURAÇÃO DOS BUCKETS
// ============================================================================

const BUCKETS_TO_CREATE = [
  {
    id: 'documents',
    name: 'Documentos Gerais',
    public: false,
    fileSizeLimit: 52428800, // 50MB em bytes
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
    description: 'Uploads gerais de documentos'
  },
  {
    id: 'kyc-documents',
    name: 'Documentos KYC',
    public: false,
    fileSizeLimit: 5242880, // 5MB em bytes
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    description: 'Documentos para verificação KYC'
  },
  {
    id: 'user-profiles',
    name: 'Imagens de Perfil',
    public: false,
    fileSizeLimit: 5242880, // 5MB em bytes
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    description: 'Imagens de perfil de usuários'
  },
  {
    id: 'contracts',
    name: 'Contratos',
    public: false,
    fileSizeLimit: 10485760, // 10MB em bytes
    allowedMimeTypes: ['application/pdf'],
    description: 'Contratos e instrumentos digitais'
  },
  {
    id: 'loan-documents',
    name: 'Documentos de Empréstimo',
    public: false,
    fileSizeLimit: 10485760, // 10MB em bytes
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    description: 'Documentos relacionados a empréstimos'
  },
  {
    id: 'credit-analysis',
    name: 'Análise de Crédito',
    public: false,
    fileSizeLimit: 10485760, // 10MB em bytes
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    description: 'Documentos para análise de crédito'
  },
  {
    id: 'audit-files',
    name: 'Arquivos de Auditoria',
    public: false,
    fileSizeLimit: 20971520, // 20MB em bytes
    allowedMimeTypes: ['application/pdf', 'application/json', 'text/plain'],
    description: 'Arquivos usados para auditoria'
  },
  {
    id: 'temporary-files',
    name: 'Arquivos Temporários',
    public: false,
    fileSizeLimit: 5242880, // 5MB em bytes
    allowedMimeTypes: ['*/*'],
    description: 'Arquivos temporários que serão limpos regularmente'
  }
];

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

async function createBucket(supabase, bucketConfig) {
  try {
    const { data, error } = await supabase.storage.createBucket(
      bucketConfig.id,
      {
        public: bucketConfig.public,
        fileSizeLimit: bucketConfig.fileSizeLimit,
        allowedMimeTypes: bucketConfig.allowedMimeTypes
      }
    );

    if (error) {
      if (error.message.includes('Bucket already exists')) {
        log.info(`Bucket '${bucketConfig.id}' já existe`);
        return true;
      } else {
        throw error;
      }
    }

    log.success(`Bucket '${bucketConfig.id}' criado com sucesso`);
    log.info(`  - Nome: ${bucketConfig.name}`);
    log.info(`  - Público: ${bucketConfig.public ? 'Sim' : 'Não'}`);
    log.info(`  - Limite de tamanho: ${bucketConfig.fileSizeLimit}`);
    log.info(`  - Tipos MIME permitidos: ${bucketConfig.allowedMimeTypes.join(', ')}`);
    
    return true;
  } catch (error) {
    log.error(`Erro ao criar bucket '${bucketConfig.id}': ${error.message}`);
    return false;
  }
}

async function updateBucketPolicy(supabase, bucketId) {
  try {
    // This would require RLS policies to be set up in your database
    // For now, we'll log what policies should be created
    
    log.info(`Políticas de acesso para bucket '${bucketId}' (configurar manualmente):`);
    log.info(`  - Usuários autenticados podem ler seus próprios arquivos`);
    log.info(`  - Usuários autenticados podem fazer upload de arquivos`);
    log.info(`  - Apenas admin pode gerenciar todos os arquivos`);
    
    return true;
  } catch (error) {
    log.error(`Erro ao configurar políticas para '${bucketId}': ${error.message}`);
    return false;
  }
}

async function main() {
  log.title();
  console.log(`${colors.bold}${colors.magenta}📦 CRIANDO BUCKETS DO SUPABASE - QI CREDIT${colors.reset}`);
  log.title();

  // Verificar variáveis de ambiente
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log.error('Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas');
    log.info('Execute: cp .env.example .env e configure as variáveis');
    process.exit(1);
  }

  log.section('1. Iniciando conexão com Supabase');

  // Criar cliente do Supabase
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

  log.info(`Conectando ao projeto: ${process.env.SUPABASE_URL.split('.')[0].replace('https://', '')}`);

  // Listar buckets existentes
  log.section('2. Verificando buckets existentes');
  const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    log.error(`Erro ao listar buckets existentes: ${listError.message}`);
    process.exit(1);
  }

  if (existingBuckets.length > 0) {
    log.info(`${existingBuckets.length} bucket(s) já existentes:`);
    existingBuckets.forEach(bucket => {
      log.info(`  - ${bucket.name} (ID: ${bucket.id}, Público: ${bucket.public ? 'Sim' : 'Não'})`);
    });
  } else {
    log.info('Nenhum bucket encontrado');
  }

  log.section('3. Criando buckets necessários');

  let createdCount = 0;
  let failedCount = 0;

  for (const bucketConfig of BUCKETS_TO_CREATE) {
    log.info(`\nCriando bucket: ${bucketConfig.id}`);
    
    const success = await createBucket(supabase, bucketConfig);
    
    if (success) {
      // Configurar políticas para o bucket
      await updateBucketPolicy(supabase, bucketConfig.id);
      createdCount++;
    } else {
      failedCount++;
    }
  }

  log.section('4. Resultado Final');

  if (failedCount === 0) {
    log.success(`✅ Todos os ${createdCount} buckets foram criados/atualizados com sucesso!`);
  } else {
    log.warning(`⚠️ ${createdCount} buckets criados, ${failedCount} falharam`);
  }

  // Listar buckets novamente para confirmar
  log.info('\nBuckets após execução:');
  const { data: finalBuckets, error: finalListError } = await supabase.storage.listBuckets();
  
  if (finalListError) {
    log.error(`Erro ao listar buckets finais: ${finalListError.message}`);
  } else {
    finalBuckets.forEach(bucket => {
      log.info(`  - ${bucket.name} (ID: ${bucket.id})`);
    });
  }

  log.title();
  console.log(`${colors.bold}${colors.green}🎉 PROCESSO CONCLUÍDO${colors.reset}`);
  log.title();
}

// Executar script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\nScript concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      log.error(`Erro fatal: ${error.message}`);
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createBucket, updateBucketPolicy, BUCKETS_TO_CREATE };