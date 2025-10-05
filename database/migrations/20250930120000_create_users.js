exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('document', 20).notNullable().unique();
    table.string('document_hash', 64).index();
    table.binary('document_enc');
    table.string('name', 160).notNullable();
    table.string('email', 160).notNullable().unique();
    table.string('phone', 30);
    table.date('birth_date');
    table.decimal('monthly_income', 18, 2);
    table.integer('credit_score');
    table.string('kyc_status', 32).defaultTo('PENDING');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users');
};
