#!/usr/bin/env node

/**
 * Script completo para testar funcionalidades de autenticação Supabase
 */

require('dotenv').config();
const axios = require('axios');

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

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/auth`;

// Dados de teste
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test123456',
  full_name: 'Usuário de Teste',
  phone: '11999999999',
};

let authTokens = {
  access_token: null,
  refresh_token: null,
};

/**
 * Função auxiliar para fazer requisições HTTP
 */
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

/**
 * Teste 1: Registro de usuário
 */
async function testUserRegistration() {
  log.test('Testando registro de usuário...');

  const result = await makeRequest('POST', '/register', testUser);

  if (result.success) {
    log.success('Usuário registrado com sucesso');
    log.info(`ID do usuário: ${result.data.user.id}`);
    log.info(`Email: ${result.data.user.email}`);
    return true;
  } else {
    log.error(`Falha no registro: ${result.error.error || result.error}`);
    return false;
  }
}

/**
 * Teste 2: Login do usuário
 */
async function testUserLogin() {
  log.test('Testando login do usuário...');

  const result = await makeRequest('POST', '/login', {
    email: testUser.email,
    password: testUser.password,
  });

  if (result.success && result.data.tokens) {
    authTokens.access_token = result.data.tokens.access_token;
    authTokens.refresh_token = result.data.tokens.refresh_token;

    log.success('Login realizado com sucesso');
    log.info(`Token obtido: ${authTokens.access_token.substring(0, 50)}...`);
    return true;
  } else {
    log.error(`Falha no login: ${result.error.error || result.error}`);
    return false;
  }
}

/**
 * Teste 3: Obter perfil do usuário
 */
async function testGetProfile() {
  log.test('Testando obtenção do perfil...');

  if (!authTokens.access_token) {
    log.error('Token de acesso não disponível');
    return false;
  }

  const result = await makeRequest('GET', '/profile', null, {
    Authorization: `Bearer ${authTokens.access_token}`,
  });

  if (result.success) {
    log.success('Perfil obtido com sucesso');
    log.info(`Nome: ${result.data.user.metadata?.full_name || 'N/A'}`);
    log.info(
      `Email verificado: ${result.data.user.email_verified ? 'Sim' : 'Não'}`
    );
    return true;
  } else {
    log.error(`Falha ao obter perfil: ${result.error.error || result.error}`);
    return false;
  }
}

/**
 * Teste 4: Atualizar perfil
 */
async function testUpdateProfile() {
  log.test('Testando atualização do perfil...');

  if (!authTokens.access_token) {
    log.error('Token de acesso não disponível');
    return false;
  }

  const updates = {
    full_name: 'Nome Atualizado',
    phone: '11888888888',
  };

  const result = await makeRequest('PUT', '/profile', updates, {
    Authorization: `Bearer ${authTokens.access_token}`,
  });

  if (result.success) {
    log.success('Perfil atualizado com sucesso');
    return true;
  } else {
    log.error(
      `Falha ao atualizar perfil: ${result.error.error || result.error}`
    );
    return false;
  }
}

/**
 * Teste 5: Refresh token
 */
async function testRefreshToken() {
  log.test('Testando renovação do token...');

  if (!authTokens.refresh_token) {
    log.error('Refresh token não disponível');
    return false;
  }

  const result = await makeRequest('POST', '/refresh-token', {
    refresh_token: authTokens.refresh_token,
  });

  if (result.success && result.data.tokens) {
    const oldToken = authTokens.access_token.substring(0, 20);
    authTokens.access_token = result.data.tokens.access_token;
    authTokens.refresh_token = result.data.tokens.refresh_token;

    log.success('Token renovado com sucesso');
    log.info(`Token anterior: ${oldToken}...`);
    log.info(`Novo token: ${authTokens.access_token.substring(0, 20)}...`);
    return true;
  } else {
    log.error(`Falha na renovação: ${result.error.error || result.error}`);
    return false;
  }
}

/**
 * Teste 6: Status de autenticação
 */
async function testAuthStatus() {
  log.test('Testando status de autenticação...');

  // Teste sem token
  let result = await makeRequest('GET', '/status');

  if (result.success && result.data.authenticated === false) {
    log.success('Status sem autenticação: OK');
  } else {
    log.warning('Status sem autenticação inesperado');
  }

  // Teste com token
  if (authTokens.access_token) {
    result = await makeRequest('GET', '/status', null, {
      Authorization: `Bearer ${authTokens.access_token}`,
    });

    if (result.success && result.data.authenticated === true) {
      log.success('Status com autenticação: OK');
      log.info(`Usuário autenticado: ${result.data.user.email}`);
      return true;
    } else {
      log.error('Status com autenticação falhou');
      return false;
    }
  }

  return true;
}

/**
 * Teste 7: Reset de senha
 */
async function testPasswordReset() {
  log.test('Testando reset de senha...');

  const result = await makeRequest('POST', '/reset-password', {
    email: testUser.email,
  });

  if (result.success) {
    log.success('Reset de senha solicitado com sucesso');
    return true;
  } else {
    log.error(`Falha no reset: ${result.error.error || result.error}`);
    return false;
  }
}

/**
 * Teste 8: Validação de dados inválidos
 */
async function testInvalidData() {
  log.test('Testando validação de dados inválidos...');

  // Teste registro com email inválido
  let result = await makeRequest('POST', '/register', {
    email: 'email-invalido',
    password: '123',
  });

  if (!result.success && result.status === 400) {
    log.success('Validação de email inválido: OK');
  } else {
    log.warning('Validação de email deveria falhar');
  }

  // Teste login sem dados
  result = await makeRequest('POST', '/login', {});

  if (!result.success && result.status === 400) {
    log.success('Validação de login sem dados: OK');
    return true;
  } else {
    log.warning('Validação de login vazia deveria falhar');
    return false;
  }
}

/**
 * Teste 9: Acesso com token inválido
 */
async function testInvalidToken() {
  log.test('Testando acesso com token inválido...');

  const result = await makeRequest('GET', '/profile', null, {
    Authorization: 'Bearer token-invalido-123',
  });

  if (!result.success && result.status === 403) {
    log.success('Rejeição de token inválido: OK');
    return true;
  } else {
    log.error('Token inválido deveria ser rejeitado');
    return false;
  }
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log(
    colors.magenta + '🚀 TESTES DE AUTENTICAÇÃO SUPABASE' + colors.reset
  );
  console.log('='.repeat(60));

  const tests = [
    { name: 'Registro de Usuário', test: testUserRegistration },
    { name: 'Login do Usuário', test: testUserLogin },
    { name: 'Obter Perfil', test: testGetProfile },
    { name: 'Atualizar Perfil', test: testUpdateProfile },
    { name: 'Renovar Token', test: testRefreshToken },
    { name: 'Status de Autenticação', test: testAuthStatus },
    { name: 'Reset de Senha', test: testPasswordReset },
    { name: 'Validação de Dados', test: testInvalidData },
    { name: 'Token Inválido', test: testInvalidToken },
  ];

  const results = [];

  for (const { name, test } of tests) {
    console.log('\n' + '-'.repeat(40));
    try {
      const result = await test();
      results.push({ name, status: result ? 'PASSOU' : 'FALHOU' });
    } catch (error) {
      log.error(`Erro no teste ${name}: ${error.message}`);
      results.push({ name, status: 'ERRO' });
    }
  }

  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log(
    colors.magenta + '📋 RESUMO DOS TESTES DE AUTENTICAÇÃO' + colors.reset
  );
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
    console.log(`${icon} ${result.name.padEnd(25)} ${result.status}`);
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
      `${colors.green}🎉 Sistema de autenticação está funcionando bem!${colors.reset}`
    );
  } else if (percentage >= 50) {
    console.log(
      `${colors.yellow}⚠️  Sistema parcialmente funcional. Alguns ajustes necessários.${colors.reset}`
    );
  } else {
    console.log(
      `${colors.red}🔧 Sistema precisa de correções significativas.${colors.reset}`
    );
  }

  console.log(
    '\n' + colors.blue + 'ℹ Dados do usuário de teste:' + colors.reset
  );
  console.log(`📧 Email: ${testUser.email}`);
  console.log(`🔑 Senha: ${testUser.password}`);

  console.log('\n' + '='.repeat(60));
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const main = async () => {
    log.info(`Verificando servidor em ${BASE_URL}...`);

    const serverRunning = await checkServer();
    if (!serverRunning) {
      log.error(`Servidor não está respondendo em ${BASE_URL}`);
      log.info('Certifique-se de que o servidor está rodando com: npm run dev');
      process.exit(1);
    }

    log.success('Servidor está respondendo');
    await runAllTests();
  };

  main().catch((error) => {
    log.error(`Erro geral: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testUserRegistration,
  testUserLogin,
  testGetProfile,
  testUpdateProfile,
  testRefreshToken,
  testAuthStatus,
  testPasswordReset,
  runAllTests,
};
