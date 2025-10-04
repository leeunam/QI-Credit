// Migration: create_kyc_verifications

exports.up = async function (knex) {
  await knex.schema.createTable('kyc_verifications', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users');
    table.string('verification_type', 32).notNullable();
    table.string('status', 24).notNullable().defaultTo('PENDING');
    table.jsonb('result');
    table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
    table.index(['user_id']);
    table.index(['status']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('kyc_verifications');
};
