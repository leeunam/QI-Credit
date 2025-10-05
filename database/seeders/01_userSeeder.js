const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  
  await knex('users').insert([
    {
      id: uuidv4(),
      document: '12345678901',
      name: 'João Silva',
      email: 'joao@example.com',
      phone: '+5511999999999',
      birth_date: '1990-01-15',
      monthly_income: 5000.00,
      credit_score: 750,
      kyc_status: 'APPROVED',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      document: '98765432109',
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '+5511888888888',
      birth_date: '1985-05-20',
      monthly_income: 7500.00,
      credit_score: 800,
      kyc_status: 'APPROVED',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: uuidv4(),
      document: '11122233344',
      name: 'Pedro Costa',
      email: 'pedro@example.com',
      phone: '+5511777777777',
      birth_date: '1992-03-10',
      monthly_income: 4500.00,
      credit_score: 680,
      kyc_status: 'PENDING',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};