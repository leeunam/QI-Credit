// Migration: create_webhook_events

exports.up = async function (knex) {
  await knex.schema.createTable('webhook_events', (table) => {
    table.uuid('id').primary();
    table.string('event_type', 64).notNullable();
    table.uuid('related_entity_id');
    table.jsonb('payload');
    table.timestamp('timestamp').notNullable().defaultTo(knex.fn.now());
    table.index(['event_type']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('webhook_events');
};
