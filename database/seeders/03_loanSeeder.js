const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  
  const users = await knex('users').select('id').limit(2);
  const offers = await knex('marketplace_offers').select('id', 'investor_id').limit(1);
  
  if (users.length >= 2 && offers.length >= 1) {
    await knex('loans').insert([
      {
        id: uuidv4(),
        borrower_id: users[1].id, 
        marketplace_offer_id: offers[0].id,
        amount: 8000.00,
        rate: 0.15,
        term_days: 360,
        status: 'ACTIVE',
        disbursed_at: knex.fn.now(),
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      }
    ]);
  }
};