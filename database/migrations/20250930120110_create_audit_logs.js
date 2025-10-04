exports.up = async function (knex) {
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary();
    table
      .uuid('actor_user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('entity', 64).notNullable();
    table.uuid('entity_id').notNullable();
    table.string('action', 64).notNullable();
    table.jsonb('diff');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['entity', 'entity_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('audit_logs');
};
