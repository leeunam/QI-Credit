// Migration: create_escrow_events

exports.up = async function (knex) {
  await knex.schema.createTable('escrow_events', (table) => {
    table.uuid('id').primary();
    table
      .uuid('loan_id')
      .notNullable()
      .references('id')
      .inTable('loan_contracts')
      .onDelete('CASCADE');
    table.string('event_type', 32).notNullable();
    table.decimal('amount', 18, 2);
    table.text('tx_hash');
    table.text('event_hash');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['loan_id', 'created_at']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('escrow_events');
};
