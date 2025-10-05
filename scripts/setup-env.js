#!/usr/bin/env node

/**
 * QI Credit - Script de Configuração de Ambiente
 * 
 * Copia .env.example para .env e guia o usuário através da configuração
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.clear();
  log.title('🔧 QI CREDIT - CONFIGURAÇÃO DE AMBIENTE');

  const rootDir = path.resolve(__dirname, '..');
  const envExamplePath = path.join(rootDir, '.env.example');
  const envPath = path.join(rootDir, '.env');

  // Verificar se .env.example existe
  if (!fs.existsSync(envExamplePath)) {
    log.error('Arquivo .env.example não encontrado!');
    process.exit(1);
  }

  // Verificar se .env já existe
  if (fs.existsSync(envPath)) {
    log.warning('Arquivo .env já existe!');
    const overwrite = await question('Deseja sobrescrever? (s/N): ');
    if (overwrite.toLowerCase() !== 's') {
      log.info('Operação cancelada.');
      rl.close();
      return;
    }
  }

  // Copiar .env.example para .env
  try {
    fs.copyFileSync(envExamplePath, envPath);
    log.success('Arquivo .env criado com sucesso!');
  } catch (error) {
    log.error(`Erro ao criar .env: ${error.message}`);
    process.exit(1);
  }

  console.log('\n' + colors.bold + 'Próximos passos:' + colors.reset);
  console.log('1. Configure as variáveis no arquivo .env:');
  console.log(`   ${colors.cyan}nano .env${colors.reset} (ou seu editor preferido)`);
  console.log('\n2. Variáveis importantes para configurar:');
  console.log('   • DB_PASSWORD - senha do PostgreSQL');
  console.log('   • QITECH_API_KEY - chave da API QI Tech');
  console.log('   • JWT_SECRET - secret para tokens JWT');
  console.log('   • PRIVATE_KEY - chave privada blockchain');
  console.log('\n3. Execute o setup completo:');
  console.log(`   ${colors.cyan}npm run setup${colors.reset}`);
  
  rl.close();
}

if (require.main === module) {
  main().catch(error => {
    log.error(`Erro: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };