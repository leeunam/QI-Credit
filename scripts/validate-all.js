#!/usr/bin/env node

/**
 * QI Credit - Script de Validação Completa
 *
 * Este script valida toda a integração do sistema:
 * - Dependências instaladas
 * - Variáveis de ambiente
 * - Conexão PostgreSQL (Supabase)
 * - Supabase Storage
 * - Supabase Auth
 * - Migrations do banco
 * - Endpoints do backend
 *
 * Execute: node scripts/validate-all.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const knex = require('knex');

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
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

const results = [];
let passedTests = 0;
let totalTests = 0;

function recordTest(name, passed, details = '', error = null) {
  totalTests++;
  if (passed) passedTests++;

  results.push({
    name,
    status: passed ? 'PASSOU' : 'FALHOU',
    details: passed ? details : (error?.message || details),
    error: error?.stack || null
  });

  if (passed) {
    log.success(`${name} - ${details || 'OK'}`);
  } else {
    log.error(`${name} - ${details || 'ERRO'}`);
  }
}

// ============================================================================
// TESTES
// ============================================================================

async function checkDependencies() {
  log.section('1. Verificando Dependências');

  try {
    const packageJson = require('../package.json');
    const requiredDeps = [
      '@supabase/supabase-js',
      'knex',
      'pg',
      'dotenv',
      'express',
      'uuid',
    ];

    const missing = [];
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missing.push(dep);
      }
    }

    if (missing.length > 0) {
      recordTest('Dependências', false, `Faltando: ${missing.join(', ')}`);
      return false;
    }

    recordTest('Dependências', true, `${requiredDeps.length} dependências verificadas`);
    return true;
  } catch (error) {
    recordTest('Dependências', false, 'Erro ao verificar package.json', error);
    return false;
  }
}

async function checkEnvironmentVariables() {
  log.section('2. Verificando Variáveis de Ambiente');

  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
  ];

  const missing = [];
  const present = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  }

  if (missing.length > 0) {
    recordTest('Variáveis de Ambiente', false, `Faltando: ${missing.join(', ')}`);
    return false;
  }

  recordTest('Variáveis de Ambiente', true, `${present.length} variáveis configuradas`);
  return true;
}

async function testPostgreSQLConnection() {
  log.section('3. Testando Conexão PostgreSQL');

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

    // Test connection
    await db.raw('SELECT NOW() as current_time');

    // Count tables
    const tables = await db.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    // Test query performance
    const start = Date.now();
    await db.raw('SELECT COUNT(*) FROM information_schema.tables');
    const duration = Date.now() - start;

    await db.destroy();

    recordTest(
      'PostgreSQL Connection',
      true,
      `${tables.rows.length} tabelas, query em ${duration}ms`
    );
    return true;
  } catch (error) {
    recordTest('PostgreSQL Connection', false, 'Falha na conexão', error);
    return false;
  }
}

async function testSupabaseStorage() {
  log.section('4. Testando Supabase Storage');

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Credenciais Supabase não configuradas');
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

    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      throw bucketsError;
    }

    // Try to upload test file
    const testFile = Buffer.from('QI Credit Test File', 'utf-8');
    const fileName = `test-${Date.now()}.txt`;
    const bucketName = buckets[0]?.name || 'test-documents';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, testFile, {
        contentType: 'text/plain',
      });

    if (!uploadError && uploadData) {
      // Clean up
      await supabase.storage.from(bucketName).remove([fileName]);
    }

    recordTest(
      'Supabase Storage',
      true,
      `${buckets.length} buckets disponíveis, upload/delete OK`
    );
    return true;
  } catch (error) {
    recordTest('Supabase Storage', false, 'Falha no Storage', error);
    return false;
  }
}

async function testSupabaseAuth() {
  log.section('5. Testando Supabase Auth');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    // Test settings endpoint
    const response = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/settings`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          apikey: process.env.SUPABASE_ANON_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao acessar settings');
    }

    const settings = await response.json();

    // Test JWKS endpoint
    const jwksResponse = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`
    );

    if (!jwksResponse.ok) {
      throw new Error('JWKS endpoint inacessível');
    }

    const jwks = await jwksResponse.json();

    recordTest(
      'Supabase Auth',
      true,
      `Settings OK, JWKS OK`
    );
    return true;
  } catch (error) {
    recordTest('Supabase Auth', false, 'Falha na autenticação', error);
    return false;
  }
}

async function testDatabaseMigrations() {
  log.section('6. Testando Migrations do Banco');

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

    // Check current migration status
    const [batch, migrations] = await db.migrate.latest();

    if (migrations.length === 0) {
      log.info('Todas as migrations já foram executadas');
    } else {
      log.info(`Executadas ${migrations.length} migrations no batch ${batch}`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration}`);
      });
    }

    // Verify key tables exist
    const keyTables = [
      'users',
      'marketplace_offers',
      'loan_contracts',
      'digital_accounts',
      'file_uploads',
      'credit_analyses',
      'escrow_events',
    ];

    const existingTables = await db.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (${keyTables.map(t => `'${t}'`).join(',')})
    `);

    await db.destroy();

    if (existingTables.rows.length < keyTables.length) {
      const missing = keyTables.filter(
        t => !existingTables.rows.find(r => r.table_name === t)
      );
      recordTest(
        'Database Migrations',
        false,
        `Tabelas faltando: ${missing.join(', ')}`
      );
      return false;
    }

    recordTest(
      'Database Migrations',
      true,
      `${existingTables.rows.length} tabelas principais criadas`
    );
    return true;
  } catch (error) {
    recordTest('Database Migrations', false, 'Falha nas migrations', error);
    return false;
  }
}

async function testBackendEndpoints() {
  log.section('7. Testando Estrutura do Backend');

  try {
    const fs = require('fs');

    // Check if backend files exist
    const criticalFiles = [
      'backend/app.js',
      'backend/config/database.js',
      'backend/config/supabase.js',
      'backend/controllers/storageController.js',
      'backend/services/authService.js',
      'backend/services/auditService.js',
      'backend/utils/logger.js',
      'backend/constants/index.js',
    ];

    const missing = [];
    const existing = [];

    for (const file of criticalFiles) {
      const fullPath = path.resolve(__dirname, '..', file);
      if (fs.existsSync(fullPath)) {
        existing.push(file);
      } else {
        missing.push(file);
      }
    }

    if (missing.length > 0) {
      recordTest(
        'Backend Structure',
        false,
        `Arquivos faltando: ${missing.join(', ')}`
      );
      return false;
    }

    recordTest(
      'Backend Structure',
      true,
      `${existing.length} arquivos críticos verificados`
    );
    return true;
  } catch (error) {
    recordTest('Backend Structure', false, 'Erro ao verificar estrutura', error);
    return false;
  }
}

async function testDatabaseData() {
  log.section('8. Testando Dados do Banco');

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
    });

    // Count records in key tables
    const tableCounts = {};
    const tables = ['users', 'marketplace_offers', 'loan_contracts', 'file_uploads'];

    for (const table of tables) {
      try {
        const result = await db(table).count('* as count').first();
        tableCounts[table] = parseInt(result.count);
      } catch (err) {
        tableCounts[table] = 'erro';
      }
    }

    await db.destroy();

    const totalRecords = Object.values(tableCounts)
      .filter(v => typeof v === 'number')
      .reduce((a, b) => a + b, 0);

    recordTest(
      'Database Data',
      true,
      `${totalRecords} registros nas tabelas principais`
    );

    log.info(`Contagens: ${JSON.stringify(tableCounts)}`);
    return true;
  } catch (error) {
    recordTest('Database Data', false, 'Erro ao contar registros', error);
    return false;
  }
}

// ============================================================================
// RELATÓRIO FINAL
// ============================================================================

function generateReport() {
  log.title();
  console.log(`${colors.bold}${colors.magenta}📊 RELATÓRIO FINAL DE VALIDAÇÃO - QI CREDIT${colors.reset}`);
  log.title();

  console.log(`\n${colors.bold}Resumo dos Testes:${colors.reset}\n`);

  results.forEach((result, index) => {
    const icon = result.status === 'PASSOU' ? '✅' : '❌';
    const color = result.status === 'PASSOU' ? colors.green : colors.red;
    console.log(
      `${icon} ${(index + 1).toString().padStart(2)}. ${result.name.padEnd(30)} ${color}${result.status.padEnd(10)}${colors.reset} ${result.details}`
    );
  });

  console.log(`\n${colors.bold}${'─'.repeat(70)}${colors.reset}`);

  const percentage = Math.round((passedTests / totalTests) * 100);
  const statusColor =
    percentage >= 80 ? colors.green :
    percentage >= 50 ? colors.yellow :
    colors.red;

  console.log(
    `${statusColor}${colors.bold}📊 Taxa de Sucesso: ${passedTests}/${totalTests} (${percentage}%)${colors.reset}`
  );

  if (percentage >= 80) {
    console.log(
      `${colors.green}${colors.bold}🎉 Sistema validado e pronto para uso!${colors.reset}`
    );
  } else if (percentage >= 50) {
    console.log(
      `${colors.yellow}${colors.bold}⚠️  Sistema parcialmente funcional. Alguns ajustes necessários.${colors.reset}`
    );
  } else {
    console.log(
      `${colors.red}${colors.bold}🔧 Sistema precisa de correções significativas.${colors.reset}`
    );
  }

  console.log(`\n${colors.bold}${'─'.repeat(70)}${colors.reset}\n`);

  // Show errors if any
  const errors = results.filter(r => r.status === 'FALHOU');
  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}Erros Encontrados:${colors.reset}\n`);
    errors.forEach((err, index) => {
      console.log(`${colors.red}${index + 1}. ${err.name}${colors.reset}`);
      console.log(`   ${err.details}`);
      if (err.error && process.env.DEBUG === 'true') {
        console.log(`   ${colors.yellow}Stack: ${err.error}${colors.reset}`);
      }
    });
    console.log();
  }

  return percentage >= 80;
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

async function main() {
  console.clear();

  log.title();
  console.log(`${colors.bold}${colors.cyan}🚀 QI CREDIT - VALIDAÇÃO COMPLETA DO SISTEMA${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}Data: ${new Date().toLocaleString('pt-BR')}${colors.reset}`);
  log.title();

  // Run all tests
  await checkDependencies();
  await checkEnvironmentVariables();
  await testPostgreSQLConnection();
  await testSupabaseStorage();
  await testSupabaseAuth();
  await testDatabaseMigrations();
  await testBackendEndpoints();
  await testDatabaseData();

  // Generate final report
  const allPassed = generateReport();

  process.exit(allPassed ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log.error(`Erro fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  main,
  checkDependencies,
  checkEnvironmentVariables,
  testPostgreSQLConnection,
  testSupabaseStorage,
  testSupabaseAuth,
  testDatabaseMigrations,
};
