const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  
  const users = await knex('users').select('id').limit(2);
  const offers = await knex('marketplace_offers').select('id', 'investor_id').limit(1);
  
  if (users.length >= 2 && offers.length >= 1) {
    await knex('loan_contracts').insert([
      {
        id: uuidv4(),
        borrower_id: users[1].id, 
        offer_id: offers[0].id,
        lender_id: offers[0].investor_id,
        principal: 8000.00,
        interest_rate: 0.15,
        installments: 12,
        status: 'ACTIVE',
        signed_at: knex.fn.now(),
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      }
    ]);
  }
};