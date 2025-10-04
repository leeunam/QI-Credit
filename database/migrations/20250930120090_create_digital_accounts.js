exports.up = async function (knex) {
  await knex.schema.createTable('digital_accounts', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('account_id'); // referência externa
    table.string('agency_number', 16);
    table.string('account_number', 32);
    table.string('account_digit', 8);
    table.string('bank_code', 16);
    table.string('bank_name', 64);
    table.string('account_type', 24);
    table.string('status', 24).defaultTo('ACTIVE');
    table.jsonb('pix_keys');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.index(['user_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('digital_accounts');
};
