#!/usr/bin/env node

/**
 * TESTE RIGOROSO DO BANCO DE DADOS REAL
 * Verifica se os dados estão sendo persistidos no Supabase e não em mock
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Configuração
const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://nhphwurogtpokxsaajjn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente Supabase para verificações diretas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Cores para logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.blue}🧪 ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(`${colors.bold}${colors.magenta}${msg}${colors.reset}`),
};

let testUserId = null;
let authToken = null;
let testResults = [];

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
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
        ...headers,
      },
    };

    if (data) {
      if (isFormData) {
        config.data = data;
        Object.assign(config.headers, data.getHeaders());
      } else {
        config.data = data;
      }
    }

    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      status: response.status,
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
 * Verificar se o servidor está rodando
 */
async function checkServer() {
  log.info('Verificando servidor...');
  const result = await makeRequest('GET', '/health');

  if (!result.success) {
    throw new Error('Servidor não está respondendo');
  }

  log.success('Servidor está respondendo');
  return result.data;
}

/**
 * TESTE 1: Verificar se Supabase não está em mock mode
 */
async function testSupabaseConnection() {
  log.test('Verificando conexão real com Supabase');

  try {
    // Testar conexão direta com Supabase
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      throw new Error(`Erro ao conectar no Supabase: ${error.message}`);
    }

    if (!buckets || buckets.length === 0) {
      throw new Error('Nenhum bucket encontrado - possível mock mode');
    }

    log.success(`Supabase conectado - ${buckets.length} buckets encontrados`);
    log.info(`Buckets: ${buckets.map((b) => b.name).join(', ')}`);

    return { success: true, buckets: buckets.length };
  } catch (error) {
    throw new Error(`Falha na conexão Supabase: ${error.message}`);
  }
}

/**
 * TESTE 2: Verificar se dados são persistidos na tabela users do Supabase
 */
async function testUserPersistence() {
  log.test('Testando persistência de usuários no banco real');

  const testEmail = `realdb-test-${Date.now()}@example.com`;
  const testPassword = 'Test123456';

  // Registrar usuário via API
  const registerResult = await makeRequest('POST', '/api/auth/register', {
    email: testEmail,
    password: testPassword,
    full_name: 'Teste Real DB',
    document: `TEST${Date.now()}`,
    name: 'Teste Real DB',
  });

  if (!registerResult.success) {
    throw new Error(
      `Falha no registro: ${JSON.stringify(registerResult.error)}`
    );
  }

  testUserId = registerResult.data.user.id;
  log.success(`Usuário registrado via API: ${testUserId.substring(0, 8)}...`);

  // Verificar diretamente no Supabase se o usuário foi criado
  const { data: authUser, error: authError } =
    await supabase.auth.admin.getUserById(testUserId);

  if (authError || !authUser) {
    throw new Error(
      `Usuário não encontrado no Supabase Auth: ${authError?.message}`
    );
  }

  log.success(`Usuário confirmado no Supabase Auth: ${authUser.user.email}`);

  // Verificar na tabela users local se existir
  try {
    const { data: localUser, error: localError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (localError && localError.code !== 'PGRST116') {
      log.warning(
        `Tabela users local não encontrada ou erro: ${localError.message}`
      );
    } else if (localUser) {
      log.success(
        `Usuário confirmado na tabela users local: ${localUser.email}`
      );
    }
  } catch (localCheckError) {
    log.warning(
      `Não foi possível verificar tabela users local: ${localCheckError.message}`
    );
  }

  return { success: true, userId: testUserId, email: testEmail };
}

/**
 * TESTE 3: Testar login e verificar tokens reais
 */
async function testRealAuthentication() {
  log.test('Testando autenticação com tokens reais');

  if (!testUserId) {
    throw new Error('Usuário de teste não foi criado');
  }

  // Fazer login
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: `realdb-test-${testUserId.split('-')[0]}@example.com`,
    password: 'Test123456',
  });

  if (!loginResult.success) {
    throw new Error(`Falha no login: ${JSON.stringify(loginResult.error)}`);
  }

  authToken = loginResult.data.tokens.access_token;
  log.success(`Token obtido: ${authToken.substring(0, 30)}...`);

  // Verificar se o token é válido no Supabase
  const { data: tokenUser, error: tokenError } = await supabase.auth.getUser(
    authToken
  );

  if (tokenError || !tokenUser.user) {
    throw new Error(`Token inválido no Supabase: ${tokenError?.message}`);
  }

  log.success(`Token validado no Supabase: ${tokenUser.user.email}`);

  return { success: true, token: authToken };
}

/**
 * TESTE 4: Testar upload real no Supabase Storage
 */
async function testRealFileUpload() {
  log.test('Testando upload real no Supabase Storage');

  if (!authToken) {
    throw new Error('Token de autenticação não disponível');
  }

  // Criar arquivo de teste
  const testContent = `Teste Real DB - ${new Date().toISOString()}\nUsuário: ${testUserId}`;
  const testFilePath = `/tmp/realdb-test-${Date.now()}.txt`;
  fs.writeFileSync(testFilePath, testContent);

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), 'realdb-test.txt');
    form.append('bucket', 'test-documents');
    form.append('folder', 'real-tests');
    form.append('userId', testUserId);

    const uploadResult = await makeRequest(
      'POST',
      '/api/storage/upload',
      form,
      { Authorization: `Bearer ${authToken}` },
      true
    );

    // Limpar arquivo local
    fs.unlinkSync(testFilePath);

    if (!uploadResult.success) {
      throw new Error(`Falha no upload: ${JSON.stringify(uploadResult.error)}`);
    }

    const uploadedFile = uploadResult.data.data;
    log.success(`Arquivo enviado via API: ${uploadedFile.fileName}`);

    // Verificar diretamente no Supabase Storage
    const { data: files, error: listError } = await supabase.storage
      .from('test-documents')
      .list('real-tests');

    if (listError) {
      throw new Error(
        `Erro ao listar arquivos no Supabase: ${listError.message}`
      );
    }

    const uploadedFileExists = files.some((file) =>
      file.name.includes('realdb-test')
    );
    if (!uploadedFileExists) {
      throw new Error('Arquivo não encontrado no Supabase Storage');
    }

    log.success(
      `Arquivo confirmado no Supabase Storage: ${files.length} arquivos na pasta`
    );

    return {
      success: true,
      fileName: uploadedFile.fileName,
      filesCount: files.length,
    };
  } catch (error) {
    // Limpar arquivo em caso de erro
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    throw error;
  }
}

/**
 * TESTE 5: Verificar persistência após reiniciar servidor (simulado)
 */
async function testDataPersistence() {
  log.test('Verificando persistência de dados');

  if (!testUserId || !authToken) {
    throw new Error('Dados de teste não disponíveis');
  }

  // Verificar se o usuário ainda existe via API
  const profileResult = await makeRequest('GET', '/api/auth/profile', null, {
    Authorization: `Bearer ${authToken}`,
  });

  if (!profileResult.success) {
    throw new Error(
      `Perfil não acessível: ${JSON.stringify(profileResult.error)}`
    );
  }

  log.success(`Perfil persistido: ${profileResult.data.email}`);

  // Verificar arquivos ainda existem
  const filesResult = await makeRequest(
    'GET',
    '/api/storage/files?bucket=test-documents',
    null,
    {
      Authorization: `Bearer ${authToken}`,
    }
  );

  if (!filesResult.success) {
    throw new Error(
      `Erro ao listar arquivos: ${JSON.stringify(filesResult.error)}`
    );
  }

  const testFiles = filesResult.data.data.filter(
    (file) => file.original_name && file.original_name.includes('realdb-test')
  );

  log.success(
    `Arquivos persistidos: ${testFiles.length} arquivo(s) de teste encontrado(s)`
  );

  return { success: true, files: testFiles.length };
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
  console.log('\n');
  log.header('═══════════════════════════════════════════════════════════════');
  log.header('🗄️  TESTE RIGOROSO DO BANCO DE DADOS REAL');
  log.header('═══════════════════════════════════════════════════════════════');
  log.info(`Servidor: ${BASE_URL}`);
  log.info(`Supabase: ${SUPABASE_URL}`);
  log.header('═══════════════════════════════════════════════════════════════');

  const tests = [
    { name: 'Verificar servidor', fn: checkServer },
    { name: 'Conexão real Supabase', fn: testSupabaseConnection },
    { name: 'Persistência de usuários', fn: testUserPersistence },
    { name: 'Autenticação real', fn: testRealAuthentication },
    { name: 'Upload real Storage', fn: testRealFileUpload },
    { name: 'Persistência de dados', fn: testDataPersistence },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      log.header(`\n▶️ ${test.name.toUpperCase()}`);
      const result = await test.fn();
      log.success(`${test.name} - PASSOU`);
      if (result && typeof result === 'object') {
        Object.entries(result).forEach(([key, value]) => {
          if (key !== 'success') {
            log.info(`   ${key}: ${value}`);
          }
        });
      }
      passed++;
    } catch (error) {
      log.error(`${test.name} - FALHOU`);
      log.error(`   ${error.message}`);
      failed++;
    }
  }

  // Relatório final
  console.log('\n');
  log.header('═══════════════════════════════════════════════════════════════');
  log.header('📊 RELATÓRIO FINAL');
  log.header('═══════════════════════════════════════════════════════════════');

  if (failed === 0) {
    log.success(`✅ TODOS OS TESTES PASSARAM (${passed}/${tests.length})`);
    log.success('🎉 BANCO DE DADOS CONFIRMADO COMO REAL - NÃO MOCADO');
    log.success('💾 Dados sendo persistidos no Supabase corretamente');
  } else {
    log.error(`❌ ${failed} teste(s) falharam de ${tests.length} total`);
    log.warning('🔍 Verificar configurações do banco de dados');
  }

  const successRate = Math.round((passed / tests.length) * 100);
  log.info(`📈 Taxa de sucesso: ${successRate}%`);

  log.header('═══════════════════════════════════════════════════════════════');

  process.exit(failed === 0 ? 0 : 1);
}

// Executar testes
if (require.main === module) {
  runAllTests().catch((error) => {
    log.error(`Erro geral: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  makeRequest,
  testSupabaseConnection,
  testUserPersistence,
  testRealAuthentication,
  testRealFileUpload,
  testDataPersistence,
};
