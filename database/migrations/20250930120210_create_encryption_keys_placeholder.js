// Migration: encryption keys placeholder (logical, no real keys stored here)
// This table can store key metadata (NOT the private material) for future KMS integration.

exports.up = async function (knex) {
  await knex.schema.createTable('encryption_key_metadata', (table) => {
    table.uuid('id').primary();
    table.string('key_alias', 64).notNullable();
    table.string('provider', 32).notNullable().defaultTo('LOCAL'); // LOCAL | KMS | HSM
    table.string('status', 24).notNullable().defaultTo('ACTIVE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('rotated_at');
    table.unique(['key_alias']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('encryption_key_metadata');
};
