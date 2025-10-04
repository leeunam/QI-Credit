// Migration: create_transactions

exports.up = async function (knex) {
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary();
    table
      .uuid('digital_account_id')
      .references('id')
      .inTable('digital_accounts');
    table.uuid('loan_id').references('id').inTable('loan_contracts');
    table.decimal('amount', 18, 2).notNullable();
    table.string('currency', 8).notNullable().defaultTo('BRL');
    table.string('direction', 8).notNullable(); // IN / OUT
    table.string('tx_type', 32).notNullable();
    table.string('status', 24).notNullable().defaultTo('PENDING');
    table.text('reference');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['loan_id']);
    table.index(['digital_account_id', 'created_at']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('transactions');
};
