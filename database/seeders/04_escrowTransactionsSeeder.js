const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  
  const loans = await knex('loans').select('id', 'borrower_id').limit(1);
  const offers = await knex('marketplace_offers').select('id', 'investor_id').limit(1);
  
  if (loans.length >= 1 && offers.length >= 1) {
    await knex('escrow_transactions').insert([
      {
        id: uuidv4(),
        loan_id: loans[0].id,
        from_user_id: offers[0].investor_id,
        to_user_id: loans[0].borrower_id,
        amount: 8000.00,
        transaction_type: 'DEPOSIT',
        status: 'COMPLETED',
        blockchain_tx_hash: '0x1234567890abcdef1234567890abcdef12345678',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      }
    ]);
  }
};