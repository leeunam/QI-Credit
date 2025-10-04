const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  
  const users = await knex('users').select('id').limit(2);
  
  if (users.length >= 2) {
    await knex('marketplace_offers').insert([
      {
        id: uuidv4(),
        investor_id: users[0].id,
        amount: 10000.00,
        rate: 0.15,
        term_days: 360,
        risk_profile: 'LOW',
        status: 'OPEN',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      },
      {
        id: uuidv4(),
        investor_id: users[1].id,
        amount: 25000.00,
        rate: 0.18,
        term_days: 720,
        risk_profile: 'MEDIUM',
        status: 'OPEN',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      },
      {
        id: uuidv4(),
        investor_id: users[0].id,
        amount: 5000.00,
        rate: 0.22,
        term_days: 180,
        risk_profile: 'HIGH',
        status: 'OPEN',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      }
    ]);
  }
};