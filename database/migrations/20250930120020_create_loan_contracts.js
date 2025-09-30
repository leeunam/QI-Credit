// Migration: create_loan_contracts

exports.up = async function (knex) {
  await knex.schema.createTable('loan_contracts', (table) => {
    table.uuid('id').primary();
    table.uuid('offer_id').references('id').inTable('marketplace_offers');
    table.uuid('borrower_id').references('id').inTable('users');
    table.uuid('lender_id').references('id').inTable('users');
    table.decimal('principal', 18, 2).notNullable();
    table.decimal('interest_rate', 9, 6).notNullable();
    table.integer('installments').notNullable();
    table.string('status', 24).notNullable().defaultTo('DRAFT');
    table.string('contract_type', 24);
    table.jsonb('repayment_schedule');
    table.text('blockchain_contract_address');
    table.timestamp('signed_at');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.index(['status']);
    table.index(['borrower_id']);
    table.index(['lender_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('loan_contracts');
};
