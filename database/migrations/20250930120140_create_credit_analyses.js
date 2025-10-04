exports.up = async function (knex) {
  await knex.schema.createTable('credit_analyses', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('document', 20).notNullable();
    table.string('analysis_type', 32).notNullable(); // individual / business
    table.string('status', 24).notNullable().defaultTo('PENDING');
    table.integer('score');
    table.string('provider_id', 64);
    table.jsonb('result');
    table.jsonb('metadata');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.index(['user_id']);
    table.index(['status']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('credit_analyses');
};
