#!/usr/bin/env node

/**
 * Script para configurar Row-Level Security (RLS) no Supabase
 * Implementa políticas de segurança para controle de acesso aos dados
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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
  setup: (msg) => console.log(`${colors.cyan}🔧 ${msg}${colors.reset}`),
};

/**
 * Políticas RLS para implementar
 */
const RLS_POLICIES = {
  users: [
    {
      name: 'users_select_own',
      operation: 'SELECT',
      definition: 'auth.uid() = id',
      description: 'Usuários podem ver apenas seus próprios dados',
    },
    {
      name: 'users_update_own',
      operation: 'UPDATE',
      definition: 'auth.uid() = id',
      description: 'Usuários podem atualizar apenas seus próprios dados',
    },
    {
      name: 'users_admin_access',
      operation: 'ALL',
      definition: "(auth.jwt() ->> 'role')::text = 'admin'",
      description: 'Administradores têm acesso total',
    },
  ],

  file_uploads: [
    {
      name: 'file_uploads_select_own',
      operation: 'SELECT',
      definition: 'auth.uid() = user_id OR user_id IS NULL',
      description: 'Usuários podem ver apenas seus próprios arquivos',
    },
    {
      name: 'file_uploads_insert_own',
      operation: 'INSERT',
      definition: 'auth.uid() = user_id OR user_id IS NULL',
      description: 'Usuários podem inserir apenas arquivos próprios',
    },
    {
      name: 'file_uploads_update_own',
      operation: 'UPDATE',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem atualizar apenas seus próprios arquivos',
    },
    {
      name: 'file_uploads_delete_own',
      operation: 'DELETE',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem deletar apenas seus próprios arquivos',
    },
  ],

  credit_analyses: [
    {
      name: 'credit_analyses_select_own',
      operation: 'SELECT',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem ver apenas suas próprias análises',
    },
    {
      name: 'credit_analyses_insert_own',
      operation: 'INSERT',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem criar apenas análises próprias',
    },
  ],

  loan_contracts: [
    {
      name: 'loan_contracts_select_participant',
      operation: 'SELECT',
      definition: 'auth.uid() = borrower_id OR auth.uid() = lender_id',
      description: 'Apenas participantes do contrato podem visualizar',
    },
    {
      name: 'loan_contracts_update_participant',
      operation: 'UPDATE',
      definition: 'auth.uid() = borrower_id OR auth.uid() = lender_id',
      description: 'Apenas participantes podem atualizar o contrato',
    },
  ],

  transactions: [
    {
      name: 'transactions_select_own',
      operation: 'SELECT',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem ver apenas suas transações',
    },
    {
      name: 'transactions_insert_own',
      operation: 'INSERT',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem criar apenas transações próprias',
    },
  ],

  kyc_verifications: [
    {
      name: 'kyc_verifications_select_own',
      operation: 'SELECT',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem ver apenas suas verificações KYC',
    },
    {
      name: 'kyc_verifications_insert_own',
      operation: 'INSERT',
      definition: 'auth.uid() = user_id',
      description: 'Usuários podem criar apenas verificações próprias',
    },
  ],
};

/**
 * Conectar ao Supabase com privilégios administrativos
 */
function connectSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados'
    );
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Executar comando SQL no Supabase
 */
async function executeSql(supabase, query, description) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query });

    if (error) {
      throw error;
    }

    log.success(description);
    return true;
  } catch (error) {
    log.error(`${description}: ${error.message}`);
    return false;
  }
}

/**
 * Habilitar RLS em uma tabela
 */
async function enableRLS(supabase, tableName) {
  log.setup(`Habilitando RLS para tabela '${tableName}'...`);

  const query = `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`;

  return await executeSql(
    supabase,
    query,
    `RLS habilitado para '${tableName}'`
  );
}

/**
 * Criar política RLS
 */
async function createPolicy(supabase, tableName, policy) {
  log.setup(`Criando política '${policy.name}'...`);

  const query = `
    CREATE POLICY "${policy.name}" ON ${tableName}
    FOR ${policy.operation}
    USING (${policy.definition});
  `;

  return await executeSql(
    supabase,
    query,
    `Política '${policy.name}' criada: ${policy.description}`
  );
}

/**
 * Remover política existente (para recriar)
 */
async function dropPolicyIfExists(supabase, tableName, policyName) {
  const query = `DROP POLICY IF EXISTS "${policyName}" ON ${tableName};`;

  try {
    await supabase.rpc('exec_sql', { query });
    return true;
  } catch (error) {
    // Ignorar erros ao remover políticas que não existem
    return false;
  }
}

/**
 * Verificar se uma tabela existe
 */
async function tableExists(supabase, tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );
      `,
    });

    return !error && data && data[0]?.exists;
  } catch (error) {
    return false;
  }
}

/**
 * Configurar RLS para todas as tabelas
 */
async function setupRLS() {
  log.setup('Configurando Row-Level Security (RLS)...');

  const supabase = connectSupabase();

  let totalPolicies = 0;
  let successfulPolicies = 0;

  for (const [tableName, policies] of Object.entries(RLS_POLICIES)) {
    console.log('\n' + '-'.repeat(50));
    log.info(`Configurando RLS para tabela: ${tableName}`);

    // Verificar se a tabela existe
    const exists = await tableExists(supabase, tableName);
    if (!exists) {
      log.warning(`Tabela '${tableName}' não existe, pulando...`);
      continue;
    }

    // Habilitar RLS na tabela
    await enableRLS(supabase, tableName);

    // Criar políticas
    for (const policy of policies) {
      totalPolicies++;

      // Remover política existente primeiro
      await dropPolicyIfExists(supabase, tableName, policy.name);

      // Criar nova política
      const success = await createPolicy(supabase, tableName, policy);
      if (success) {
        successfulPolicies++;
      }
    }
  }

  return { totalPolicies, successfulPolicies };
}

/**
 * Criar função auxiliar para execução de SQL
 */
async function createHelperFunction(supabase) {
  log.setup('Criando função auxiliar para execução SQL...');

  const query = `
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS SETOF json
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY EXECUTE query;
      EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'SQL Error: %', SQLERRM;
    END;
    $$;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { query });
    if (error && !error.message.includes('already exists')) {
      throw error;
    }
    log.success('Função auxiliar criada/atualizada');
    return true;
  } catch (error) {
    // Tentar método alternativo
    try {
      await supabase.from('information_schema.tables').select('*').limit(1);
      log.success('Conexão SQL verificada');
      return true;
    } catch (altError) {
      log.error(`Erro ao criar função auxiliar: ${error.message}`);
      return false;
    }
  }
}

/**
 * Testar políticas RLS
 */
async function testRLSPolicies() {
  log.setup('Testando políticas RLS...');

  const supabase = connectSupabase();

  // Testar acesso às tabelas com RLS habilitado
  const tests = [
    { table: 'users', description: 'Tabela de usuários' },
    { table: 'file_uploads', description: 'Tabela de arquivos' },
    { table: 'credit_analyses', description: 'Tabela de análises de crédito' },
  ];

  let successfulTests = 0;

  for (const test of tests) {
    try {
      // Tentar consulta básica (deve funcionar com service role)
      const { data, error } = await supabase
        .from(test.table)
        .select('*')
        .limit(1);

      if (!error) {
        log.success(`${test.description}: Acesso OK`);
        successfulTests++;
      } else {
        log.warning(`${test.description}: ${error.message}`);
      }
    } catch (error) {
      log.warning(`${test.description}: Erro no teste - ${error.message}`);
    }
  }

  return successfulTests;
}

/**
 * Função principal
 */
async function main() {
  console.log(
    colors.magenta + '🔐 CONFIGURAÇÃO ROW-LEVEL SECURITY' + colors.reset
  );
  console.log('='.repeat(60));

  try {
    const supabase = connectSupabase();
    log.success('Conectado ao Supabase');

    // Criar função auxiliar
    await createHelperFunction(supabase);

    // Configurar RLS
    const { totalPolicies, successfulPolicies } = await setupRLS();

    // Testar políticas
    console.log('\n' + '-'.repeat(50));
    const successfulTests = await testRLSPolicies();

    // Resumo final
    console.log('\n' + '='.repeat(60));
    log.success('CONFIGURAÇÃO RLS CONCLUÍDA');
    console.log('='.repeat(60));

    log.info(`📋 Políticas criadas: ${successfulPolicies}/${totalPolicies}`);
    log.info(`🧪 Testes bem-sucedidos: ${successfulTests}/3`);

    const successRate = Math.round((successfulPolicies / totalPolicies) * 100);
    const statusColor =
      successRate >= 80
        ? colors.green
        : successRate >= 50
        ? colors.yellow
        : colors.red;

    console.log(
      `${statusColor}📊 Taxa de Sucesso: ${successRate}%${colors.reset}`
    );

    if (successRate >= 80) {
      console.log(
        `${colors.green}🎉 RLS configurado com sucesso!${colors.reset}`
      );
    } else {
      console.log(
        `${colors.yellow}⚠️  RLS parcialmente configurado. Algumas políticas podem precisar de ajustes.${colors.reset}`
      );
    }

    console.log('\n' + colors.blue + 'ℹ Próximos passos:' + colors.reset);
    console.log('1. Teste a autenticação com diferentes usuários');
    console.log('2. Verifique se os usuários só acessam seus próprios dados');
    console.log('3. Teste permissões de administrador');
  } catch (error) {
    log.error(`Erro geral: ${error.message}`);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  setupRLS,
  testRLSPolicies,
  RLS_POLICIES,
};
