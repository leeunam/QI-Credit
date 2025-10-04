#!/usr/bin/env node

/**
 * Script de teste completo para integração Supabase
 * Este script testa todas as funcionalidades: PostgreSQL, Storage e Auth
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const knex = require('knex');

// Cores para logs
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
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

async function testPostgreSQLConnection() {
  log.test('Testando conexão PostgreSQL com Supabase...');

  try {
    const db = knex({
      client: 'postgresql',
      connection: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
      },
      pool: { min: 1, max: 2 },
    });

    // Teste básico de conexão
    await db.raw('SELECT NOW() as current_time');
    log.success('Conexão PostgreSQL estabelecida');

    // Teste de tabelas existentes
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tables.rows.length > 0) {
      log.success(`Encontradas ${tables.rows.length} tabelas:`);
      tables.rows.forEach((table) => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      log.warning('Nenhuma tabela encontrada. Execute as migrações.');
    }

    // Teste de performance
    const start = Date.now();
    await db.raw('SELECT COUNT(*) FROM information_schema.tables');
    const duration = Date.now() - start;
    log.info(`Query executada em ${duration}ms`);

    await db.destroy();
    return true;
  } catch (error) {
    log.error(`Falha na conexão PostgreSQL: ${error.message}`);
    if (error.message.includes('password')) {
      log.warning(
        'Possível problema com a senha. Verifique as credenciais no .env'
      );
    }
    return false;
  }
}

async function testSupabaseClient() {
  log.test('Testando cliente Supabase...');

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados'
      );
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

    // Teste de listagem de buckets
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      throw bucketsError;
    }

    log.success('Cliente Supabase conectado');
    log.info(
      `Buckets disponíveis: ${
        buckets.map((b) => b.name).join(', ') || 'Nenhum'
      }`
    );

    // Teste de criação de bucket se não existir
    const testBucketName = 'test-documents';
    const bucketExists = buckets.find((b) => b.name === testBucketName);

    if (!bucketExists) {
      log.info(`Criando bucket de teste: ${testBucketName}`);
      const { error: createError } = await supabase.storage.createBucket(
        testBucketName,
        {
          public: false,
          allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
        }
      );

      if (createError && !createError.message.includes('already exists')) {
        throw createError;
      }
      log.success('Bucket de teste criado');
    }

    return supabase;
  } catch (error) {
    log.error(`Falha no cliente Supabase: ${error.message}`);
    return null;
  }
}

async function testStorageOperations(supabase) {
  if (!supabase) return false;

  log.test('Testando operações de Storage...');

  try {
    const testFile = Buffer.from('Este é um arquivo de teste', 'utf-8');
    const fileName = `test-${Date.now()}.txt`;
    const bucketName = 'test-documents';

    // Upload de arquivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, testFile, {
        contentType: 'text/plain',
        metadata: {
          originalName: 'test-file.txt',
          uploadedAt: new Date().toISOString(),
        },
      });

    if (uploadError) {
      throw uploadError;
    }

    log.success(`Arquivo enviado: ${uploadData.path}`);

    // Geração de URL assinada
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 3600);

    if (urlError) {
      throw urlError;
    }

    log.success('URL assinada gerada');
    log.info(`URL temporária: ${urlData.signedUrl.substring(0, 50)}...`);

    // Listagem de arquivos
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 10 });

    if (listError) {
      throw listError;
    }

    log.success(`Encontrados ${files.length} arquivos no bucket`);

    // Limpeza - remover arquivo de teste
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (deleteError) {
      log.warning(`Erro ao remover arquivo de teste: ${deleteError.message}`);
    } else {
      log.info('Arquivo de teste removido');
    }

    return true;
  } catch (error) {
    log.error(`Falha nas operações de Storage: ${error.message}`);
    return false;
  }
}

async function testAuthConfiguration() {
  log.test('Testando configuração de Autenticação...');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY // Usando anon key para auth
    );

    // Verificar configurações do projeto
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/settings`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          apikey: process.env.SUPABASE_ANON_KEY,
        },
      }
    );

    if (response.ok) {
      const settings = await response.json();
      log.success('Configurações de auth acessíveis');
      log.info(
        `Providers habilitados: ${
          settings.external
            ? Object.keys(settings.external).join(', ')
            : 'email/password'
        }`
      );
    } else {
      log.warning('Não foi possível acessar configurações de auth');
    }

    // Verificar JWKS endpoint
    const jwksResponse = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`
    );
    if (jwksResponse.ok) {
      const jwks = await jwksResponse.json();
      log.success('JWKS endpoint acessível');
      log.info(`Chaves disponíveis: ${jwks.keys ? jwks.keys.length : 0}`);
    }

    return true;
  } catch (error) {
    log.error(`Falha na configuração de Auth: ${error.message}`);
    return false;
  }
}

async function runMigrations() {
  log.test('Executando migrações do banco...');

  try {
    const db = knex({
      client: 'postgresql',
      connection: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
      },
      migrations: {
        directory: path.resolve(__dirname, '../database/migrations'),
        tableName: 'knex_migrations',
      },
    });

    const [batch, migrations] = await db.migrate.latest();

    if (migrations.length === 0) {
      log.info('Todas as migrações já foram executadas');
    } else {
      log.success(
        `Executadas ${migrations.length} migrações no batch ${batch}`
      );
      migrations.forEach((migration) => {
        console.log(`  - ${migration}`);
      });
    }

    await db.destroy();
    return true;
  } catch (error) {
    log.error(`Falha nas migrações: ${error.message}`);
    return false;
  }
}

async function generateTestReport() {
  console.log('\n' + '='.repeat(60));
  console.log(
    `${colors.magenta}📊 RELATÓRIO DE TESTES SUPABASE${colors.reset}`
  );
  console.log('='.repeat(60));

  const tests = [
    { name: 'PostgreSQL Connection', test: testPostgreSQLConnection },
    { name: 'Supabase Client', test: testSupabaseClient },
    { name: 'Auth Configuration', test: testAuthConfiguration },
    { name: 'Database Migrations', test: runMigrations },
  ];

  const results = [];
  let supabaseClient = null;

  for (const { name, test } of tests) {
    console.log('\n' + '-'.repeat(40));
    try {
      const result = await test();
      if (name === 'Supabase Client' && result !== true && result !== false) {
        supabaseClient = result;
        results.push({
          name,
          status: 'PASSOU',
          details: 'Cliente configurado',
        });
      } else {
        results.push({
          name,
          status: result ? 'PASSOU' : 'FALHOU',
          details: result ? 'OK' : 'Erro',
        });
      }
    } catch (error) {
      results.push({ name, status: 'ERRO', details: error.message });
    }
  }

  // Teste de Storage apenas se o cliente estiver OK
  if (supabaseClient) {
    console.log('\n' + '-'.repeat(40));
    try {
      const storageResult = await testStorageOperations(supabaseClient);
      results.push({
        name: 'Storage Operations',
        status: storageResult ? 'PASSOU' : 'FALHOU',
        details: storageResult ? 'OK' : 'Erro',
      });
    } catch (error) {
      results.push({
        name: 'Storage Operations',
        status: 'ERRO',
        details: error.message,
      });
    }
  }

  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.magenta}📋 RESUMO DOS TESTES${colors.reset}`);
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.status === 'PASSOU').length;
  const total = results.length;

  results.forEach((result) => {
    const icon =
      result.status === 'PASSOU'
        ? '✅'
        : result.status === 'FALHOU'
        ? '❌'
        : '⚠️';
    console.log(
      `${icon} ${result.name.padEnd(25)} ${result.status.padEnd(10)} ${
        result.details
      }`
    );
  });

  console.log('\n' + '-'.repeat(60));
  const percentage = Math.round((passed / total) * 100);
  const statusColor =
    percentage >= 80
      ? colors.green
      : percentage >= 50
      ? colors.yellow
      : colors.red;
  console.log(
    `${statusColor}📊 Taxa de Sucesso: ${passed}/${total} (${percentage}%)${colors.reset}`
  );

  if (percentage >= 80) {
    console.log(
      `${colors.green}🎉 Integração Supabase está funcionando bem!${colors.reset}`
    );
  } else if (percentage >= 50) {
    console.log(
      `${colors.yellow}⚠️  Integração parcial. Alguns ajustes necessários.${colors.reset}`
    );
  } else {
    console.log(
      `${colors.red}🔧 Integração precisa de correções significativas.${colors.reset}`
    );
  }

  console.log('\n' + '='.repeat(60));
}

// Executar todos os testes
if (require.main === module) {
  generateTestReport()
    .then(() => {
      console.log(
        `\n${colors.blue}ℹ Use este script para validar sua integração Supabase${colors.reset}`
      );
      process.exit(0);
    })
    .catch((error) => {
      log.error(`Erro geral: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  testPostgreSQLConnection,
  testSupabaseClient,
  testStorageOperations,
  testAuthConfiguration,
  runMigrations,
};
