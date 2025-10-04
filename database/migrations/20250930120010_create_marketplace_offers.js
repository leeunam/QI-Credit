exports.up = async function (knex) {
  await knex.schema.createTable('marketplace_offers', (table) => {
    table.uuid('id').primary();
    table.uuid('investor_id').notNullable().references('id').inTable('users');
    table.decimal('amount', 18, 2).notNullable();
    table.decimal('rate', 9, 6).notNullable();
    table.integer('term_days').notNullable();
    table.string('risk_profile', 16);
    table.string('status', 24).notNullable().defaultTo('OPEN');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['status', 'risk_profile']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('marketplace_offers');
};
