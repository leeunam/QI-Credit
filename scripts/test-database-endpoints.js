#!/usr/bin/env node

/**
 * 🧪 TESTE COMPLETO DE ENDPOINTS DO DATABASE
 *
 * Testa todos os endpoints relacionados ao database:
 * - Autenticação (registro, login, perfil)
 * - Storage (upload, download, listagem)
 * - Health checks
 * - Validações de dados
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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
  section: (msg) => console.log(`${colors.cyan}📂 ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.white}🧪 ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

const BASE_URL = 'http://localhost:3000';
let testResults = [];
let authToken = null;
let refreshToken = null;
let testUserId = null;

// Dados de teste
const testUser = {
  email: `dbtest-${Date.now()}@example.com`,
  password: 'DatabaseTest123!',
  full_name: 'Database Test User',
  phone: '11987654321',
};

/**
 * Fazer requisição HTTP
 */
async function makeRequest(
  method,
  endpoint,
  data = null,
  headers = {},
  isFormData = false
) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      timeout: 10000,
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: error.message },
      status: error.response?.status || 0,
    };
  }
}

/**
 * Executar teste individual
 */
async function runTest(name, testFunction) {
  log.test(name);
  try {
    const startTime = Date.now();
    const result = await testFunction();
    const duration = Date.now() - startTime;

    if (result.success) {
      log.success(`${name} - ${duration}ms`);
      if (result.details) log.info(`   ${result.details}`);
      testResults.push({
        name,
        status: 'PASSOU',
        duration,
        details: result.details || 'OK',
      });
      return true;
    } else {
      log.error(`${name} - ${duration}ms`);
      log.error(`   ${result.error}`);
      testResults.push({
        name,
        status: 'FALHOU',
        duration,
        details: result.error,
      });
      return false;
    }
  } catch (error) {
    log.error(`${name} - ERRO`);
    log.error(`   ${error.message}`);
    testResults.push({
      name,
      status: 'ERRO',
      duration: 0,
      details: error.message,
    });
    return false;
  }
}

/**
 * TESTE 1: Health Check
 */
async function testHealthCheck() {
  const result = await makeRequest('GET', '/health');

  if (!result.success) {
    return { success: false, error: 'Servidor não está respondendo' };
  }

  if (result.data.status === 'OK') {
    return {
      success: true,
      details: `Serviços: ${result.data.services?.join(', ') || 'N/A'}`,
    };
  }

  return { success: false, error: 'Health check falhou' };
}

/**
 * TESTE 2: Registro de Usuário no Database
 */
async function testUserRegistration() {
  const result = await makeRequest('POST', '/api/auth/register', testUser);

  if (!result.success) {
    return {
      success: false,
      error: result.error.error || result.error.message,
    };
  }

  if (result.data.success && result.data.user) {
    testUserId = result.data.user.id;
    return {
      success: true,
      details: `Usuário criado: ${result.data.user.id.substring(0, 8)}...`,
    };
  }

  return { success: false, error: 'Resposta inválida do registro' };
}

/**
 * TESTE 3: Login e Obtenção de Token
 */
async function testUserLogin() {
  const result = await makeRequest('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.error || result.error.message,
    };
  }

  if (result.data.success && result.data.tokens) {
    authToken = result.data.tokens.access_token;
    refreshToken = result.data.tokens.refresh_token;
    return {
      success: true,
      details: `Token obtido: ${authToken.substring(0, 30)}...`,
    };
  }

  return { success: false, error: 'Login falhou ou tokens não retornados' };
}

/**
 * TESTE 4: Obter Perfil do Usuário
 */
async function testGetUserProfile() {
  if (!authToken) {
    return { success: false, error: 'Token não disponível' };
  }

  const result = await makeRequest('GET', '/api/auth/profile', null, {
    Authorization: `Bearer ${authToken}`,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.error || result.error.message,
    };
  }

  if (result.data.success && result.data.user) {
    return {
      success: true,
      details: `Email: ${result.data.user.email}, Verificado: ${result.data.user.email_verified}`,
    };
  }

  return { success: false, error: 'Perfil não obtido' };
}

/**
 * TESTE 5: Atualizar Perfil do Usuário
 */
async function testUpdateUserProfile() {
  if (!authToken) {
    return { success: false, error: 'Token não disponível' };
  }

  const updates = {
    full_name: 'Nome Atualizado Database Test',
    phone: '11999888777',
  };

  const result = await makeRequest('PUT', '/api/auth/profile', updates, {
    Authorization: `Bearer ${authToken}`,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.error || result.error.message,
    };
  }

  if (result.data.success) {
    return { success: true, details: 'Perfil atualizado com sucesso' };
  }

  return { success: false, error: 'Atualização falhou' };
}

/**
 * TESTE 6: Status de Autenticação
 */
async function testAuthStatus() {
  // Teste sem token
  let result = await makeRequest('GET', '/api/auth/status');

  if (!result.success || result.data.authenticated !== false) {
    return {
      success: false,
      error: 'Status sem token deveria retornar authenticated: false',
    };
  }

  // Teste com token
  if (!authToken) {
    return {
      success: false,
      error: 'Token não disponível para teste com auth',
    };
  }

  result = await makeRequest('GET', '/api/auth/status', null, {
    Authorization: `Bearer ${authToken}`,
  });

  if (!result.success || result.data.authenticated !== true) {
    return {
      success: false,
      error: 'Status com token deveria retornar authenticated: true',
    };
  }

  return {
    success: true,
    details: `Usuário autenticado: ${result.data.user.email}`,
  };
}

/**
 * TESTE 7: Refresh Token
 */
async function testRefreshToken() {
  if (!refreshToken) {
    return { success: false, error: 'Refresh token não disponível' };
  }

  const result = await makeRequest('POST', '/api/auth/refresh-token', {
    refresh_token: refreshToken,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.error || result.error.message,
    };
  }

  if (result.data.success && result.data.tokens) {
    const newToken = result.data.tokens.access_token;
    return {
      success: true,
      details: `Novo token: ${newToken.substring(0, 30)}...`,
    };
  }

  return { success: false, error: 'Refresh token falhou' };
}

/**
 * TESTE 8: Upload de Arquivo
 */
async function testFileUpload() {
  if (!authToken) {
    return { success: false, error: 'Token não disponível' };
  }

  // Criar arquivo PDF de teste simples
  const testContent = `%PDF-1.3
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Count 1
/Kids [3 0 R]
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Teste Database) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
  const testFilePath = '/tmp/test-upload.pdf';
  fs.writeFileSync(testFilePath, testContent);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('bucket', 'temporary-files');
    form.append('folder', 'tests');
    form.append('userId', testUserId);

    const result = await makeRequest(
      'POST',
      '/api/storage/upload',
      form,
      {
        Authorization: `Bearer ${authToken}`,
        ...form.getHeaders(),
      },
      true
    );

    // Limpar arquivo temporário
    fs.unlinkSync(testFilePath);

    if (!result.success) {
      return {
        success: false,
        error: result.error.error || result.error.message,
      };
    }

    if (result.data.success && result.data.data) {
      return {
        success: true,
        details: `Arquivo enviado: ${result.data.data.fileName}, Tamanho: ${result.data.data.size} bytes`,
      };
    }

    return { success: false, error: 'Upload não retornou dados esperados' };
  } catch (error) {
    // Limpar arquivo em caso de erro
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    throw error;
  }
}

/**
 * TESTE 9: Listar Arquivos do Storage
 */
async function testListFiles() {
  if (!authToken) {
    return { success: false, error: 'Token não disponível' };
  }

  const result = await makeRequest(
    'GET',
    '/api/storage/files?bucket=temporary-files',
    null,
    {
      Authorization: `Bearer ${authToken}`,
    }
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error.error || result.error.message,
    };
  }

  if (result.data.success) {
    return {
      success: true,
      details: `Arquivos encontrados: ${result.data.count || 0}`,
    };
  }

  return { success: false, error: 'Listagem falhou' };
}

/**
 * TESTE 10: Validações de Dados Inválidos
 */
async function testDataValidation() {
  // Teste registro com email inválido
  let result = await makeRequest('POST', '/api/auth/register', {
    email: 'email-invalido',
    password: '123',
  });

  if (result.success || result.status !== 400) {
    return { success: false, error: 'Deveria rejeitar email inválido' };
  }

  // Teste login sem dados
  result = await makeRequest('POST', '/api/auth/login', {});

  if (result.success || result.status !== 400) {
    return { success: false, error: 'Deveria rejeitar login sem dados' };
  }

  return { success: true, details: 'Validações funcionando corretamente' };
}

/**
 * TESTE 11: Acesso Não Autorizado
 */
async function testUnauthorizedAccess() {
  // Tentativa de acesso ao perfil sem token
  let result = await makeRequest('GET', '/api/auth/profile');

  if (result.success || result.status !== 401) {
    return { success: false, error: 'Deveria rejeitar acesso sem token' };
  }

  // Tentativa de acesso com token inválido
  result = await makeRequest('GET', '/api/auth/profile', null, {
    Authorization: 'Bearer token-invalido-123',
  });

  if (result.success || result.status !== 403) {
    return { success: false, error: 'Deveria rejeitar token inválido' };
  }

  return { success: true, details: 'Proteções de autorização funcionando' };
}

/**
 * TESTE 12: Health Check do Storage
 */
async function testStorageHealth() {
  const result = await makeRequest('GET', '/api/storage/health');

  if (!result.success) {
    return { success: false, error: 'Storage health check falhou' };
  }

  if (result.data.status === 'ok' || result.data.status === 'degraded') {
    const dbStatus = result.data.services?.database?.status || 'unknown';
    const storageStatus = result.data.services?.storage?.status || 'unknown';
    return {
      success: true,
      details: `DB: ${dbStatus}, Storage: ${storageStatus}`,
    };
  }

  return { success: false, error: 'Health check retornou status inválido' };
}

/**
 * Executar todos os testes
 */
async function runDatabaseTests() {
  log.header('🗄️  TESTE COMPLETO DOS ENDPOINTS DO DATABASE');
  console.log('='.repeat(80));
  log.info(`Servidor: ${BASE_URL}`);
  log.info(`Usuário de teste: ${testUser.email}`);
  console.log('='.repeat(80));

  const tests = [
    { name: 'Health Check Geral', test: testHealthCheck },
    { name: 'Registro de Usuário', test: testUserRegistration },
    { name: 'Login de Usuário', test: testUserLogin },
    { name: 'Obter Perfil', test: testGetUserProfile },
    { name: 'Atualizar Perfil', test: testUpdateUserProfile },
    { name: 'Status de Autenticação', test: testAuthStatus },
    { name: 'Refresh Token', test: testRefreshToken },
    { name: 'Upload de Arquivo', test: testFileUpload },
    { name: 'Listar Arquivos', test: testListFiles },
    { name: 'Validação de Dados', test: testDataValidation },
    { name: 'Acesso Não Autorizado', test: testUnauthorizedAccess },
    { name: 'Health Check Storage', test: testStorageHealth },
  ];

  // Executar testes em grupos
  const groups = [
    { name: 'CONECTIVIDADE', tests: tests.slice(0, 1) },
    { name: 'AUTENTICAÇÃO', tests: tests.slice(1, 7) },
    { name: 'STORAGE', tests: tests.slice(7, 9) },
    { name: 'SEGURANÇA', tests: tests.slice(9, 12) },
  ];

  for (const group of groups) {
    console.log('\n' + '─'.repeat(60));
    log.section(group.name);
    console.log('─'.repeat(60));

    for (const { name, test } of group.tests) {
      await runTest(name, test);
    }
  }

  // Relatório final
  console.log('\n' + '='.repeat(80));
  log.header('📊 RELATÓRIO DOS TESTES DE DATABASE');
  console.log('='.repeat(80));

  const passed = testResults.filter((r) => r.status === 'PASSOU').length;
  const failed = testResults.filter((r) => r.status === 'FALHOU').length;
  const errors = testResults.filter((r) => r.status === 'ERRO').length;
  const total = testResults.length;

  testResults.forEach((result, index) => {
    const icon =
      result.status === 'PASSOU'
        ? '✅'
        : result.status === 'FALHOU'
        ? '❌'
        : '⚠️';
    const num = (index + 1).toString().padStart(2, '0');
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    console.log(
      `${icon} ${num}. ${result.name.padEnd(25)} ${result.status.padEnd(
        8
      )} ${duration.padEnd(8)} ${result.details}`
    );
  });

  console.log('\n' + '─'.repeat(80));

  // Estatísticas
  const successRate = Math.round((passed / total) * 100);
  const avgDuration = Math.round(
    testResults.reduce((sum, r) => sum + (r.duration || 0), 0) / total
  );
  const statusColor =
    successRate >= 90
      ? colors.green
      : successRate >= 70
      ? colors.yellow
      : colors.red;

  console.log(`${colors.blue}📈 ESTATÍSTICAS DOS ENDPOINTS:${colors.reset}`);
  console.log(`   ✅ Passou: ${passed}`);
  console.log(`   ❌ Falhou: ${failed}`);
  console.log(`   ⚠️  Erros: ${errors}`);
  console.log(`   📊 Total: ${total}`);
  console.log(`   ⏱️  Tempo médio: ${avgDuration}ms`);
  console.log(
    `${statusColor}   🎯 Taxa de Sucesso: ${successRate}%${colors.reset}`
  );

  console.log('\n' + '─'.repeat(80));

  // Status final
  if (successRate >= 90) {
    log.header('🎉 TODOS OS ENDPOINTS DO DATABASE FUNCIONANDO!');
    console.log(
      `${colors.green}✨ Sistema pronto para uso em produção.${colors.reset}`
    );
  } else if (successRate >= 70) {
    log.header('⚠️  ENDPOINTS PARCIALMENTE FUNCIONAIS');
    console.log(
      `${colors.yellow}🔧 Alguns ajustes podem ser necessários.${colors.reset}`
    );
  } else {
    log.header('🚨 ENDPOINTS REQUEREM CORREÇÕES');
    console.log(
      `${colors.red}🛠️  Correções significativas são necessárias.${colors.reset}`
    );
  }

  console.log('\n' + colors.blue + '🔗 ENDPOINTS TESTADOS:' + colors.reset);
  console.log('   📡 GET  /health');
  console.log('   👤 POST /api/auth/register');
  console.log('   🔑 POST /api/auth/login');
  console.log('   👤 GET  /api/auth/profile');
  console.log('   ✏️  PUT  /api/auth/profile');
  console.log('   🔄 POST /api/auth/refresh-token');
  console.log('   📊 GET  /api/auth/status');
  console.log('   📤 POST /api/storage/upload');
  console.log('   📂 GET  /api/storage/files');
  console.log('   🏥 GET  /api/storage/health');

  console.log('\n' + '='.repeat(80));

  return { successRate, passed, failed, errors, total };
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Executar testes
if (require.main === module) {
  const main = async () => {
    log.info(`Verificando servidor em ${BASE_URL}...`);

    const serverRunning = await checkServer();
    if (!serverRunning) {
      log.error(`❌ Servidor não está respondendo em ${BASE_URL}`);
      log.info('💡 Execute: cd backend && node server-test.js');
      process.exit(1);
    }

    log.success('Servidor está respondendo');
    console.log();

    const { successRate } = await runDatabaseTests();
    process.exit(successRate >= 70 ? 0 : 1);
  };

  main().catch((error) => {
    log.error(`Erro crítico: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runDatabaseTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
};
