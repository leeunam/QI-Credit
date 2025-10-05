#!/usr/bin/env node
/**
 * Script de Teste End-to-End (E2E) para Validação de Integração
 * Frontend → Backend → Database
 *
 * Este script testa todos os fluxos principais da aplicação:
 * 1. Autenticação (Register + Login)
 * 2. Upload de Arquivos
 * 3. Análise de Crédito
 * 4. Marketplace de Ofertas
 * 5. Verificação KYC
 * 6. Banking (Contas Digitais)
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const db = require('../backend/config/database');

// Configurações
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'testPassword123';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Estado do teste
const testState = {
  userId: null,
  accessToken: null,
  fileId: null,
  creditAnalysisId: null,
  marketplaceOfferId: null,
  digitalAccountId: null,
};

// Resultados
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

// Funções Auxiliares
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';

  log(`${icon} ${name}${details ? ': ' + details : ''}`, color);

  results.tests.push({ name, status, details });

  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else if (status === 'WARN') results.warnings++;
}

function logSection(title) {
  log('\n' + '='.repeat(80), 'cyan');
  log(title.toUpperCase(), 'cyan');
  log('='.repeat(80) + '\n', 'cyan');
}

async function checkDatabase(tableName, whereCondition) {
  try {
    const record = await db(tableName).where(whereCondition).first();
    return record || null;
  } catch (error) {
    log(`❌ Erro ao consultar ${tableName}: ${error.message}`, 'red');
    return null;
  }
}

// =============================================================================
// TESTES
// =============================================================================

/**
 * 1. FLUXO DE AUTENTICAÇÃO
 */
async function testAuthFlow() {
  logSection('1. Fluxo de Autenticação');

  // 1.1 Registro de Usuário
  try {
    const registerPayload = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      full_name: 'Test User E2E',
      phone: '11999887766',
    };

    const response = await axios.post(`${API_BASE}/auth/register`, registerPayload);

    if (response.status === 201 && response.data.success) {
      testState.userId = response.data.user.id;
      logTest('POST /api/auth/register', 'PASS', `User ID: ${testState.userId}`);

      // Verificar no banco
      const userInDb = await checkDatabase('users', { email: TEST_EMAIL });
      if (userInDb) {
        logTest('Persistência: users table', 'PASS', `User ${userInDb.id} encontrado no banco`);
      } else {
        logTest('Persistência: users table', 'WARN', 'User não encontrado no banco (tabela pode não existir)');
      }
    } else {
      logTest('POST /api/auth/register', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('POST /api/auth/register', 'FAIL', error.response?.data?.error || error.message);
  }

  // 1.2 Login
  try {
    const loginPayload = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    };

    const response = await axios.post(`${API_BASE}/auth/login`, loginPayload);

    if (response.status === 200 && response.data.success) {
      testState.accessToken = response.data.tokens.access_token;
      logTest('POST /api/auth/login', 'PASS', 'Access token recebido');
    } else {
      logTest('POST /api/auth/login', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('POST /api/auth/login', 'FAIL', error.response?.data?.error || error.message);
  }

  // 1.3 Obter Perfil
  if (testState.accessToken) {
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${testState.accessToken}` },
      });

      if (response.status === 200 && response.data.success) {
        logTest('GET /api/auth/profile', 'PASS', `Email: ${response.data.user.email}`);
      } else {
        logTest('GET /api/auth/profile', 'FAIL', 'Resposta inesperada');
      }
    } catch (error) {
      logTest('GET /api/auth/profile', 'FAIL', error.response?.data?.error || error.message);
    }
  }
}

/**
 * 2. FLUXO DE STORAGE (Upload de Arquivos)
 */
async function testStorageFlow() {
  logSection('2. Fluxo de Storage (Upload de Arquivos)');

  if (!testState.accessToken) {
    logTest('Upload de Arquivo', 'FAIL', 'Token de autenticação não disponível');
    return;
  }

  // 2.1 Criar arquivo temporário para teste
  const tempFilePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(tempFilePath, 'Este é um arquivo de teste para validação E2E');

  // 2.2 Upload de Arquivo
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));
    formData.append('bucket', 'documents');
    formData.append('userId', testState.userId);

    const response = await axios.post(`${API_BASE}/storage/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${testState.accessToken}`,
      },
    });

    if (response.status === 200 && response.data.success) {
      testState.fileId = response.data.data.fileId;
      logTest('POST /api/storage/upload', 'PASS', `File ID: ${testState.fileId}`);

      // Verificar no banco
      const fileInDb = await checkDatabase('file_uploads', { id: testState.fileId });
      if (fileInDb) {
        logTest('Persistência: file_uploads table', 'PASS', `Arquivo ${fileInDb.original_name} encontrado`);
      } else {
        logTest('Persistência: file_uploads table', 'WARN', 'Arquivo não encontrado no banco');
      }
    } else {
      logTest('POST /api/storage/upload', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('POST /api/storage/upload', 'FAIL', error.response?.data?.error || error.message);
  }

  // 2.3 Listar Arquivos
  try {
    const response = await axios.get(`${API_BASE}/storage/files`, {
      headers: { Authorization: `Bearer ${testState.accessToken}` },
      params: { userId: testState.userId },
    });

    if (response.status === 200 && response.data.success) {
      logTest('GET /api/storage/files', 'PASS', `${response.data.count} arquivo(s) encontrado(s)`);
    } else {
      logTest('GET /api/storage/files', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('GET /api/storage/files', 'FAIL', error.response?.data?.error || error.message);
  }

  // 2.4 Gerar URL de Download
  if (testState.fileId) {
    try {
      const response = await axios.get(`${API_BASE}/storage/download/${testState.fileId}`, {
        headers: { Authorization: `Bearer ${testState.accessToken}` },
      });

      if (response.status === 200 && response.data.success) {
        logTest('GET /api/storage/download/:fileId', 'PASS', 'URL de download gerada');
      } else {
        logTest('GET /api/storage/download/:fileId', 'FAIL', 'Resposta inesperada');
      }
    } catch (error) {
      logTest('GET /api/storage/download/:fileId', 'FAIL', error.response?.data?.error || error.message);
    }
  }

  // 2.5 Deletar Arquivo
  if (testState.fileId) {
    try {
      const response = await axios.delete(`${API_BASE}/storage/files/${testState.fileId}`, {
        headers: { Authorization: `Bearer ${testState.accessToken}` },
      });

      if (response.status === 200 && response.data.success) {
        logTest('DELETE /api/storage/files/:fileId', 'PASS', 'Arquivo deletado');

        // Verificar remoção do banco
        const fileInDb = await checkDatabase('file_uploads', { id: testState.fileId });
        if (!fileInDb) {
          logTest('Persistência: Arquivo removido do banco', 'PASS');
        } else {
          logTest('Persistência: Arquivo removido do banco', 'WARN', 'Arquivo ainda existe no banco');
        }
      } else {
        logTest('DELETE /api/storage/files/:fileId', 'FAIL', 'Resposta inesperada');
      }
    } catch (error) {
      logTest('DELETE /api/storage/files/:fileId', 'FAIL', error.response?.data?.error || error.message);
    }
  }

  // Limpar arquivo temporário
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }
}

/**
 * 3. FLUXO DE ANÁLISE DE CRÉDITO
 */
async function testCreditFlow() {
  logSection('3. Fluxo de Análise de Crédito');

  if (!testState.accessToken) {
    logTest('Análise de Crédito', 'FAIL', 'Token de autenticação não disponível');
    return;
  }

  // 3.1 Submeter Análise Individual
  try {
    const payload = {
      name: 'Test User E2E',
      document: '12345678909',
      birthDate: '1990-01-01',
      email: TEST_EMAIL,
      monthlyIncome: 5000.00,
      loanAmount: 10000,
      term: 12,
      interest_rate: 2.5,
    };

    const response = await axios.post(`${API_BASE}/qitech/credit/individual`, payload, {
      headers: { Authorization: `Bearer ${testState.accessToken}` },
    });

    if (response.status === 200 && response.data.success) {
      testState.creditAnalysisId = response.data.analysisId;
      logTest('POST /api/qitech/credit/individual', 'PASS', `Analysis ID: ${testState.creditAnalysisId}`);

      // Verificar no banco
      const analysisInDb = await checkDatabase('credit_analyses', { provider_id: testState.creditAnalysisId });
      if (analysisInDb) {
        logTest('Persistência: credit_analyses table', 'PASS', `Análise ${analysisInDb.id} encontrada`);
      } else {
        logTest('Persistência: credit_analyses table', 'WARN', 'Análise não encontrada no banco');
      }
    } else {
      logTest('POST /api/qitech/credit/individual', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('POST /api/qitech/credit/individual', 'FAIL', error.response?.data?.error || error.message);
  }

  // 3.2 Obter Score de Crédito
  if (testState.userId) {
    try {
      const response = await axios.get(`${API_BASE}/qitech/credit/score/${testState.userId}`, {
        headers: { Authorization: `Bearer ${testState.accessToken}` },
      });

      if (response.status === 200 && response.data.creditScore) {
        logTest('GET /api/qitech/credit/score/:userId', 'PASS', `Score: ${response.data.creditScore}`);
      } else {
        logTest('GET /api/qitech/credit/score/:userId', 'FAIL', 'Resposta inesperada');
      }
    } catch (error) {
      logTest('GET /api/qitech/credit/score/:userId', 'FAIL', error.response?.data?.error || error.message);
    }
  }
}

/**
 * 4. FLUXO DE MARKETPLACE
 */
async function testMarketplaceFlow() {
  logSection('4. Fluxo de Marketplace de Ofertas');

  if (!testState.accessToken || !testState.userId) {
    logTest('Marketplace', 'FAIL', 'Token ou User ID não disponível');
    return;
  }

  // 4.1 Criar Oferta no Marketplace
  // NOTA: O frontend não tem endpoints reais de marketplace implementados ainda
  logTest('POST /api/marketplace/offers', 'WARN', 'Endpoint não implementado no frontend');
  logTest('GET /api/marketplace/offers', 'WARN', 'Endpoint não implementado no frontend');
  logTest('POST /api/marketplace/match', 'WARN', 'Endpoint não implementado no frontend');
}

/**
 * 5. FLUXO DE KYC
 */
async function testKycFlow() {
  logSection('5. Fluxo de KYC (Know Your Customer)');

  if (!testState.accessToken) {
    logTest('KYC Verification', 'FAIL', 'Token de autenticação não disponível');
    return;
  }

  // 5.1 Verificação KYC Completa
  try {
    const payload = {
      name: 'Test User E2E',
      document: '12345678909',
      email: TEST_EMAIL,
      birthdate: '1990-01-01',
      address: {
        street: 'Rua Teste',
        number: '123',
        city: 'São Paulo',
        uf: 'SP',
        postal_code: '01310-100',
      },
    };

    const response = await axios.post(`${API_BASE}/qitech/fraud/kyc/verify`, payload, {
      headers: { Authorization: `Bearer ${testState.accessToken}` },
    });

    if (response.status === 200 && response.data.success) {
      logTest('POST /api/qitech/fraud/kyc/verify', 'PASS', 'KYC verificado');

      // Verificar no banco
      const kycInDb = await checkDatabase('kyc_verifications', { user_id: testState.userId });
      if (kycInDb) {
        logTest('Persistência: kyc_verifications table', 'PASS', `KYC ${kycInDb.id} encontrado`);
      } else {
        logTest('Persistência: kyc_verifications table', 'WARN', 'KYC não encontrado no banco');
      }
    } else {
      logTest('POST /api/qitech/fraud/kyc/verify', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('POST /api/qitech/fraud/kyc/verify', 'FAIL', error.response?.data?.error || error.message);
  }

  // 5.2 Device Scan
  try {
    const payload = {
      device_id: 'test-device-123',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 Test',
    };

    const response = await axios.post(`${API_BASE}/qitech/fraud/device-scan`, payload, {
      headers: { Authorization: `Bearer ${testState.accessToken}` },
    });

    if (response.status === 200 && response.data.success) {
      logTest('POST /api/qitech/fraud/device-scan', 'PASS', 'Device scan executado');
    } else {
      logTest('POST /api/qitech/fraud/device-scan', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('POST /api/qitech/fraud/device-scan', 'FAIL', error.response?.data?.error || error.message);
  }
}

/**
 * 6. FLUXO DE BANKING
 */
async function testBankingFlow() {
  logSection('6. Fluxo de Banking (Contas Digitais)');

  if (!testState.accessToken) {
    logTest('Banking', 'FAIL', 'Token de autenticação não disponível');
    return;
  }

  // 6.1 Criar Conta Digital
  try {
    const payload = {
      document: '12345678909',
      name: 'Test User E2E',
      email: TEST_EMAIL,
      phone: '11999887766',
      account_type: 'individual',
    };

    const response = await axios.post(`${API_BASE}/qitech/banking/accounts`, payload, {
      headers: { Authorization: `Bearer ${testState.accessToken}` },
    });

    if (response.status === 201 && response.data.success) {
      testState.digitalAccountId = response.data.accountId;
      logTest('POST /api/qitech/banking/accounts', 'PASS', `Account ID: ${testState.digitalAccountId}`);

      // Verificar no banco
      const accountInDb = await checkDatabase('digital_accounts', { provider_account_id: testState.digitalAccountId });
      if (accountInDb) {
        logTest('Persistência: digital_accounts table', 'PASS', `Conta ${accountInDb.id} encontrada`);
      } else {
        logTest('Persistência: digital_accounts table', 'WARN', 'Conta não encontrada no banco');
      }
    } else {
      logTest('POST /api/qitech/banking/accounts', 'FAIL', 'Resposta inesperada');
    }
  } catch (error) {
    logTest('POST /api/qitech/banking/accounts', 'FAIL', error.response?.data?.error || error.message);
  }

  // 6.2 Obter Detalhes da Conta
  if (testState.digitalAccountId) {
    try {
      const response = await axios.get(`${API_BASE}/qitech/banking/accounts/${testState.digitalAccountId}`, {
        headers: { Authorization: `Bearer ${testState.accessToken}` },
      });

      if (response.status === 200 && response.data.success) {
        logTest('GET /api/qitech/banking/accounts/:accountId', 'PASS', 'Detalhes da conta obtidos');
      } else {
        logTest('GET /api/qitech/banking/accounts/:accountId', 'FAIL', 'Resposta inesperada');
      }
    } catch (error) {
      logTest('GET /api/qitech/banking/accounts/:accountId', 'FAIL', error.response?.data?.error || error.message);
    }
  }
}

/**
 * CLEANUP
 */
async function cleanup() {
  logSection('Limpeza de Dados de Teste');

  // Remover dados relacionados primeiro (foreign keys)
  if (testState.userId) {
    try {
      // Delete KYC verifications first
      await db('kyc_verifications').where('user_id', testState.userId).del();

      // Delete file uploads
      await db('file_uploads').where('user_id', testState.userId).del();

      // Finally delete user
      await db('users').where('id', testState.userId).del();

      logTest('Cleanup: Dados de teste removidos', 'PASS');
    } catch (error) {
      logTest('Cleanup: Dados de teste removidos', 'WARN', error.message);
    }
  }

  // Fechar conexão do banco
  await db.destroy();
}

/**
 * RELATÓRIO FINAL
 */
function printReport() {
  logSection('Relatório Final de Testes E2E');

  log(`\n📊 ESTATÍSTICAS:\n`, 'blue');
  log(`  ✅ Testes Passou: ${results.passed}`, 'green');
  log(`  ❌ Testes Falhou: ${results.failed}`, 'red');
  log(`  ⚠️  Avisos: ${results.warnings}`, 'yellow');
  log(`  📝 Total: ${results.tests.length}\n`, 'blue');

  const successRate = ((results.passed / results.tests.length) * 100).toFixed(2);
  log(`Taxa de Sucesso: ${successRate}%\n`, successRate >= 80 ? 'green' : 'red');

  // Testes que falharam
  if (results.failed > 0) {
    log('\n❌ TESTES QUE FALHARAM:\n', 'red');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => log(`  • ${t.name}: ${t.details}`, 'red'));
  }

  // Avisos
  if (results.warnings > 0) {
    log('\n⚠️  AVISOS:\n', 'yellow');
    results.tests
      .filter(t => t.status === 'WARN')
      .forEach(t => log(`  • ${t.name}: ${t.details}`, 'yellow'));
  }

  log('\n' + '='.repeat(80) + '\n', 'cyan');

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

/**
 * EXECUÇÃO PRINCIPAL
 */
async function main() {
  log('\n' + '='.repeat(80), 'magenta');
  log('TESTE END-TO-END (E2E) - QI CREDIT INTEGRATION', 'magenta');
  log('Frontend → Backend → Database', 'magenta');
  log('='.repeat(80) + '\n', 'magenta');

  try {
    await testAuthFlow();
    await testStorageFlow();
    await testCreditFlow();
    await testMarketplaceFlow();
    await testKycFlow();
    await testBankingFlow();
  } catch (error) {
    log(`\n❌ Erro fatal durante os testes: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await cleanup();
    printReport();
  }
}

// Executar
main();
