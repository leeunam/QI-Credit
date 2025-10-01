// Migration: create_repayments

exports.up = async function (knex) {
  await knex.schema.createTable('repayments', (table) => {
    table.uuid('id').primary();
    table
      .uuid('loan_id')
      .notNullable()
      .references('id')
      .inTable('loan_contracts')
      .onDelete('CASCADE');
    table.integer('installment_number').notNullable();
    table.decimal('principal_component', 18, 2).defaultTo(0);
    table.decimal('interest_component', 18, 2).defaultTo(0);
    table.decimal('penalty_component', 18, 2).defaultTo(0);
    table.decimal('total_paid', 18, 2).defaultTo(0);
    table.date('due_date').notNullable();
    table.date('paid_date');
    table.string('status', 24).notNullable().defaultTo('PENDING');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['loan_id', 'installment_number']);
    table.index(['loan_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('repayments');
};
