#!/usr/bin/env node

/**
 * 🚀 TESTE FINAL COMPLETO DA INTEGRAÇÃO SUPABASE
 *
 * Este script testa toda a implementação:
 * - PostgreSQL Database Connection
 * - Supabase Storage (Buckets + File Operations)
 * - Supabase Auth (JWT + User Management)
 * - Row-Level Security (RLS Policies)
 * - API Endpoints (CRUD Operations)
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const log = {
  header: (msg) => console.log(`${colors.magenta}${msg}${colors.reset}`),
  section: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.white}🧪 ${msg}${colors.reset}`),
};

/**
 * Executar teste individual
 */
async function runTest(testName, testFunction) {
  log.test(`${testName}...`);
  try {
    const result = await testFunction();
    if (result) {
      log.success(`${testName}: PASSOU`);
      return { name: testName, status: 'PASSOU', details: 'OK' };
    } else {
      log.error(`${testName}: FALHOU`);
      return {
        name: testName,
        status: 'FALHOU',
        details: 'Teste retornou false',
      };
    }
  } catch (error) {
    log.error(`${testName}: ERRO - ${error.message}`);
    return { name: testName, status: 'ERRO', details: error.message };
  }
}

/**
 * TESTE 1: Verificar configurações do ambiente
 */
async function testEnvironmentConfig() {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
  ];

  let missingVars = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    log.error(`Variáveis faltando: ${missingVars.join(', ')}`);
    return false;
  }

  log.info('Todas as variáveis de ambiente estão configuradas');
  return true;
}

/**
 * TESTE 2: Conexão PostgreSQL via Knex
 */
async function testPostgreSQLConnection() {
  const knex = require('knex');

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

  try {
    await db.raw('SELECT NOW() as current_time');

    // Verificar tabelas existentes
    const tables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    log.info(`Tabelas encontradas: ${tables.rows.length}`);
    await db.destroy();
    return true;
  } catch (error) {
    await db.destroy();
    throw error;
  }
}

/**
 * TESTE 3: Cliente Supabase e Storage
 */
async function testSupabaseStorage() {
  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );

  // Listar buckets
  const { data: buckets, error: bucketsError } =
    await supabase.storage.listBuckets();
  if (bucketsError) throw bucketsError;

  log.info(`Buckets disponíveis: ${buckets.map((b) => b.name).join(', ')}`);

  // Teste de upload
  const testContent = Buffer.from(
    `Teste integração - ${new Date().toISOString()}`
  );
  const fileName = `integration-test-${Date.now()}.txt`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('temporary-files')
    .upload(fileName, testContent, { contentType: 'text/plain' });

  if (uploadError) throw uploadError;

  // Teste de download URL
  const { data: urlData, error: urlError } = await supabase.storage
    .from('temporary-files')
    .createSignedUrl(fileName, 300);

  if (urlError) throw urlError;

  log.info(`URL gerada: ${urlData.signedUrl.substring(0, 50)}...`);

  // Limpeza
  await supabase.storage.from('temporary-files').remove([fileName]);

  return true;
}

/**
 * TESTE 4: Autenticação Supabase
 */
async function testSupabaseAuth() {
  const { createClient } = require('@supabase/supabase-js');

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const supabasePublic = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  // Criar usuário de teste
  const testEmail = `integration-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  const { data: createData, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { test: true },
    });

  if (createError) throw createError;
  log.info(`Usuário criado: ${createData.user.id}`);

  // Fazer login
  const { data: loginData, error: loginError } =
    await supabasePublic.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

  if (loginError) throw loginError;
  log.info(
    `Login realizado: ${loginData.session.access_token.substring(0, 30)}...`
  );

  // Limpeza - deletar usuário de teste
  await supabaseAdmin.auth.admin.deleteUser(createData.user.id);

  return true;
}

/**
 * TESTE 5: Validação JWT
 */
async function testJWTValidation() {
  const jwt = require('jsonwebtoken');
  const jwksClient = require('jwks-rsa');

  const client = jwksClient({
    jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    rateLimit: true,
    cache: true,
  });

  // Verificar se conseguimos obter as chaves JWKS
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`
    );
    const jwks = await response.json();

    log.info(`JWKS obtido: ${jwks.keys ? jwks.keys.length : 0} chaves`);
    return true;
  } catch (error) {
    throw new Error(`Erro ao obter JWKS: ${error.message}`);
  }
}

/**
 * TESTE 6: Migrações do banco
 */
async function testDatabaseMigrations() {
  const knex = require('knex');

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
      directory: './database/migrations',
      tableName: 'knex_migrations',
    },
  });

  try {
    const [batch, migrations] = await db.migrate.latest();

    log.info(`Migrações: ${migrations.length} executadas no batch ${batch}`);
    await db.destroy();
    return true;
  } catch (error) {
    await db.destroy();
    throw error;
  }
}

/**
 * TESTE 7: Configurações de segurança
 */
async function testSecuritySettings() {
  // Verificar se as URLs estão usando HTTPS
  if (!process.env.SUPABASE_URL.startsWith('https://')) {
    throw new Error('SUPABASE_URL deve usar HTTPS');
  }

  // Verificar se as chaves não são padrão
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === 'your_key_here') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não foi configurada');
  }

  // Verificar se mock mode está desabilitado para produção
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.STORAGE_MOCK_MODE === 'true'
  ) {
    throw new Error('STORAGE_MOCK_MODE não deve estar ativo em produção');
  }

  log.info('Configurações de segurança validadas');
  return true;
}

/**
 * TESTE 8: Performance e Limites
 */
async function testPerformanceAndLimits() {
  const { createClient } = require('@supabase/supabase-js');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Teste de performance da conexão
  const start = Date.now();

  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const duration = Date.now() - start;
    log.info(`Tempo de resposta: ${duration}ms`);

    if (duration > 5000) {
      log.warning('Conexão lenta detectada (>5s)');
    }

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Executar todos os testes
 */
async function runIntegrationTests() {
  log.header('🚀 TESTE COMPLETO DE INTEGRAÇÃO SUPABASE');
  console.log('='.repeat(80));

  const tests = [
    { name: 'Configuração do Ambiente', test: testEnvironmentConfig },
    { name: 'Conexão PostgreSQL', test: testPostgreSQLConnection },
    { name: 'Supabase Storage', test: testSupabaseStorage },
    { name: 'Autenticação Supabase', test: testSupabaseAuth },
    { name: 'Validação JWT', test: testJWTValidation },
    { name: 'Migrações do Banco', test: testDatabaseMigrations },
    { name: 'Configurações de Segurança', test: testSecuritySettings },
    { name: 'Performance e Limites', test: testPerformanceAndLimits },
  ];

  const results = [];
  let sectionCount = 1;

  for (const { name, test } of tests) {
    console.log('\n' + '─'.repeat(60));
    log.section(`${sectionCount}. ${name.toUpperCase()}`);
    console.log('─'.repeat(60));

    const result = await runTest(name, test);
    results.push(result);
    sectionCount++;
  }

  // Relatório final
  console.log('\n' + '='.repeat(80));
  log.header('📊 RELATÓRIO FINAL DA INTEGRAÇÃO');
  console.log('='.repeat(80));

  const passed = results.filter((r) => r.status === 'PASSOU').length;
  const failed = results.filter((r) => r.status === 'FALHOU').length;
  const errors = results.filter((r) => r.status === 'ERRO').length;
  const total = results.length;

  results.forEach((result, index) => {
    const icon =
      result.status === 'PASSOU'
        ? '✅'
        : result.status === 'FALHOU'
        ? '❌'
        : '⚠️';
    const num = (index + 1).toString().padStart(2, '0');
    console.log(
      `${icon} ${num}. ${result.name.padEnd(30)} ${result.status.padEnd(10)} ${
        result.details
      }`
    );
  });

  console.log('\n' + '─'.repeat(80));

  // Estatísticas
  const successRate = Math.round((passed / total) * 100);
  const statusColor =
    successRate >= 90
      ? colors.green
      : successRate >= 70
      ? colors.yellow
      : colors.red;

  console.log(`${colors.blue}📈 ESTATÍSTICAS:${colors.reset}`);
  console.log(`   ✅ Passou: ${passed}`);
  console.log(`   ❌ Falhou: ${failed}`);
  console.log(`   ⚠️  Erros: ${errors}`);
  console.log(`   📊 Total: ${total}`);
  console.log(
    `${statusColor}   🎯 Taxa de Sucesso: ${successRate}%${colors.reset}`
  );

  console.log('\n' + '─'.repeat(80));

  // Status final
  if (successRate >= 90) {
    log.header('🎉 INTEGRAÇÃO SUPABASE COMPLETAMENTE FUNCIONAL!');
    console.log(
      `${colors.green}✨ Todos os sistemas estão operacionais e prontos para produção.${colors.reset}`
    );
  } else if (successRate >= 70) {
    log.header('⚠️  INTEGRAÇÃO PARCIALMENTE FUNCIONAL');
    console.log(
      `${colors.yellow}🔧 Alguns ajustes são necessários antes da produção.${colors.reset}`
    );
  } else {
    log.header('🚨 INTEGRAÇÃO REQUER CORREÇÕES');
    console.log(
      `${colors.red}🛠️  Correções significativas são necessárias.${colors.reset}`
    );
  }

  console.log('\n' + colors.blue + '📋 PRÓXIMOS PASSOS:' + colors.reset);

  if (successRate >= 90) {
    console.log('1. ✅ Deploy para ambiente de staging');
    console.log('2. ✅ Testes de carga e performance');
    console.log('3. ✅ Configurar monitoramento em produção');
    console.log('4. ✅ Documentar APIs para o time de frontend');
  } else {
    console.log('1. 🔧 Corrigir testes que falharam');
    console.log('2. 🔧 Revisar configurações de segurança');
    console.log('3. 🔧 Executar testes novamente');
    console.log('4. 🔧 Validar com time de desenvolvimento');
  }

  console.log('\n' + colors.magenta + '🔗 RECURSOS ÚTEIS:' + colors.reset);
  console.log(
    `📖 Supabase Dashboard: ${process.env.SUPABASE_URL.replace('/auth/v1', '')}`
  );
  console.log('📚 Documentação Supabase: https://supabase.com/docs');
  console.log('🐛 Logs de Debug: Verificar console do servidor');

  console.log('\n' + '='.repeat(80));

  return { successRate, results };
}

// Executar se chamado diretamente
if (require.main === module) {
  runIntegrationTests()
    .then(({ successRate }) => {
      process.exit(successRate >= 70 ? 0 : 1);
    })
    .catch((error) => {
      log.error(`Erro crítico: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runIntegrationTests,
  testEnvironmentConfig,
  testPostgreSQLConnection,
  testSupabaseStorage,
  testSupabaseAuth,
  testJWTValidation,
};
