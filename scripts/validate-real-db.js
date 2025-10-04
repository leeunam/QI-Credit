#!/usr/bin/env node

/**
 * VALIDAÇÃO FINAL - BANCO DE DADOS REAL
 * Teste simples para confirmar que não está mocado
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (data) config.data = data;

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
}

async function testRealDatabase() {
  console.log('\n🔍 VALIDAÇÃO FINAL - BANCO DE DADOS REAL');
  console.log('================================================');
  
  // 1. Verificar se Supabase está conectado
  console.log('\n1️⃣ Verificando conexão Supabase...');
  const healthResult = await makeRequest('GET', '/api/storage/health');
  
  if (!healthResult.success) {
    console.log('❌ Falha na conectividade');
    return false;
  }
  
  const { services } = healthResult.data;
  
  if (services.storage.type === 'Supabase Storage' && services.storage.buckets.length === 8) {
    console.log('✅ Supabase Storage conectado com 8 buckets reais');
    console.log(`   Buckets: ${services.storage.buckets.join(', ')}`);
  } else {
    console.log('❌ Storage pode estar em mock mode');
    return false;
  }
  
  if (services.database.type === 'PostgreSQL' && services.database.status === 'connected') {
    console.log('✅ PostgreSQL conectado (Supabase)');
  } else {
    console.log('❌ Database pode estar em mock mode');
    return false;
  }
  
  // 2. Criar usuário e verificar persistência
  console.log('\n2️⃣ Testando persistência de dados...');
  const testEmail = `validation-${Date.now()}@example.com`;
  
  const registerResult = await makeRequest('POST', '/api/auth/register', {
    email: testEmail,
    password: 'Test123456',
    full_name: 'Validação Final',
    document: `VAL${Date.now()}`,
    name: 'Validação Final'
  });
  
  if (!registerResult.success) {
    console.log('❌ Falha no registro:', registerResult.error);
    return false;
  }
  
  console.log('✅ Usuário registrado no Supabase Auth');
  const userId = registerResult.data.user.id;
  
  // 3. Fazer login
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: testEmail,
    password: 'Test123456'
  });
  
  if (!loginResult.success) {
    console.log('❌ Falha no login:', loginResult.error);
    return false;
  }
  
  console.log('✅ Login bem-sucedido com token real do Supabase');
  const token = loginResult.data.tokens.access_token;
  
  // 4. Verificar perfil
  const profileResult = await makeRequest('GET', '/api/auth/profile', null, {
    Authorization: `Bearer ${token}`
  });
  
  if (!profileResult.success) {
    console.log('❌ Falha ao obter perfil:', profileResult.error);
    return false;
  }
  
  if (profileResult.data.email === testEmail) {
    console.log('✅ Perfil confirmado - dados persistidos no Supabase');
  } else {
    console.log('❌ Dados do perfil inconsistentes');
    return false;
  }
  
  console.log('\n🎉 CONFIRMAÇÃO FINAL:');
  console.log('================================================');
  console.log('✅ BANCO DE DADOS NÃO ESTÁ MOCADO');
  console.log('✅ SUPABASE POSTGRESQL FUNCIONANDO');
  console.log('✅ SUPABASE STORAGE FUNCIONANDO');
  console.log('✅ SUPABASE AUTH FUNCIONANDO');
  console.log('✅ DADOS SENDO PERSISTIDOS CORRETAMENTE');
  console.log('================================================');
  console.log('🎯 Sistema usando banco de dados REAL - 100% funcional!');
  
  return true;
}

testRealDatabase().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Erro na validação:', error.message);
  process.exit(1);
});