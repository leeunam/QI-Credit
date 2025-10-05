#!/usr/bin/env node

/**
 * QI Credit - Script de Inicialização
 *
 * Este script inicia o sistema completo:
 * - Valida ambiente (rápido)
 * - Inicia backend (porta 3000)
 * - Inicia frontend (porta 5173)
 *
 * Execute: node scripts/start.js
 * ou: npm start
 */

const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  title: (msg) =>
    console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
};

// Quick environment validation (removed - now inline)

// Start backend
function startBackend() {
  return new Promise((resolve) => {
    log.info('Iniciando backend na porta 3000...');

    const backend = spawn('npm', ['run', 'dev'], {
      cwd: path.resolve(__dirname, '../backend'),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    backend.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) {
        console.log(`${colors.blue}[Backend]${colors.reset} ${msg}`);
      }

      if (msg.includes('Server running') || msg.includes('listening')) {
        log.success('Backend iniciado com sucesso');
        resolve(backend);
      }
    });

    backend.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('DeprecationWarning')) {
        console.error(`${colors.red}[Backend]${colors.reset} ${msg}`);
      }
    });

    backend.on('error', (error) => {
      log.error(`Erro ao iniciar backend: ${error.message}`);
    });

    backend.on('close', (code) => {
      if (code !== 0) {
        log.error(`Backend encerrado com código ${code}`);
      }
    });

    // Resolve after 3 seconds if no success message
    setTimeout(() => {
      log.warning('Backend iniciado (timeout)');
      resolve(backend);
    }, 3000);

    return backend;
  });
}

// Start frontend
function startFrontend() {
  return new Promise((resolve) => {
    log.info('Iniciando frontend na porta 8080...');

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: path.resolve(__dirname, '../frontend'),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    frontend.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) {
        console.log(`${colors.green}[Frontend]${colors.reset} ${msg}`);
      }

      if (msg.includes('Local:') || msg.includes('localhost')) {
        log.success('Frontend iniciado com sucesso');
        resolve(frontend);
      }
    });

    frontend.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('DeprecationWarning')) {
        console.error(`${colors.yellow}[Frontend]${colors.reset} ${msg}`);
      }
    });

    frontend.on('error', (error) => {
      log.error(`Erro ao iniciar frontend: ${error.message}`);
    });

    frontend.on('close', (code) => {
      if (code !== 0) {
        log.error(`Frontend encerrado com código ${code}`);
      }
    });

    // Resolve after 5 seconds if no success message
    setTimeout(() => {
      log.warning('Frontend iniciado (timeout)');
      resolve(frontend);
    }, 5000);

    return frontend;
  });
}

// Main
async function main() {
  console.clear();

  log.title('🚀 QI CREDIT - INICIANDO SISTEMA');

  // Quick validation - only essential vars
  log.info('Validando configuração básica...');
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    log.warning('Algumas variáveis de ambiente não estão configuradas.');
    log.info('Execute: npm run setup:env para configurar o ambiente');
  } else {
    log.success('Configuração básica encontrada');
  }

  console.log();

  // Start services
  try {
    const backend = await startBackend();
    const frontend = await startFrontend();

    console.log();
    log.success('Sistema iniciado com sucesso!');
    console.log();
    log.info(`Backend:  ${colors.cyan}http://localhost:3000${colors.reset}`);
    log.info(`Frontend: ${colors.cyan}http://localhost:8080${colors.reset}`);
    console.log();
    log.warning('Pressione Ctrl+C para parar o servidor');
    console.log();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n');
      log.warning('Encerrando sistema...');

      backend.kill('SIGINT');
      frontend.kill('SIGINT');

      setTimeout(() => {
        log.success('Sistema encerrado');
        process.exit(0);
      }, 1000);
    });

    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    log.error(`Erro ao iniciar sistema: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    log.error(`Erro fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { main };
