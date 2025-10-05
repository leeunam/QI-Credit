exports.up = async function (knex) {
  await knex.schema.createTable('holds', (table) => {
    table.uuid('id').primary();
    table
      .uuid('loan_id')
      .notNullable()
      .references('id')
      .inTable('loan_contracts')
      .onDelete('CASCADE');
    table.decimal('amount', 18, 2).notNullable();
    table.string('status', 24).notNullable().defaultTo('PENDING');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['loan_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('holds');
};
