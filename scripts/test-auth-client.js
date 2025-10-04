#!/usr/bin/env node

/**
 * Cliente de teste para funcionalidades de autenticação Supabase
 */

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

const BASE_URL = 'http://localhost:3000';
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
 * Teste 1: Verificar servidor
 */
async function testServerHealth() {
  log.test('Verificando saúde do servidor...');

  try {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status === 200) {
      log.success('Servidor está funcionando');
      log.info(`Serviços: ${response.data.services?.join(', ') || 'N/A'}`);
      return true;
    }
  } catch (error) {
    log.error(`Servidor não está respondendo: ${error.message}`);
    return false;
  }
}

/**
 * Teste 2: Registro de usuário
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
 * Teste 3: Login do usuário
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
 * Teste 4: Obter perfil do usuário
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
 * Teste 5: Status de autenticação
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
 * Executar todos os testes
 */
async function runAllTests() {
  console.log(
    colors.magenta + '🚀 TESTES DE AUTENTICAÇÃO SUPABASE' + colors.reset
  );
  console.log('='.repeat(60));

  const tests = [
    { name: 'Saúde do Servidor', test: testServerHealth },
    { name: 'Registro de Usuário', test: testUserRegistration },
    { name: 'Login do Usuário', test: testUserLogin },
    { name: 'Obter Perfil', test: testGetProfile },
    { name: 'Status de Autenticação', test: testAuthStatus },
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

// Executar testes
runAllTests().catch((error) => {
  log.error(`Erro geral: ${error.message}`);
  process.exit(1);
});
