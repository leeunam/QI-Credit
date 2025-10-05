exports.up = async function (knex) {
  await knex.schema.alterTable('digital_accounts', (table) => {
    table.decimal('balance', 15, 2).defaultTo(0);
    table.string('external_account_id');
    table.jsonb('metadata');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('digital_accounts', (table) => {
    table.dropColumn('balance');
    table.dropColumn('external_account_id');
    table.dropColumn('metadata');
  });
};
