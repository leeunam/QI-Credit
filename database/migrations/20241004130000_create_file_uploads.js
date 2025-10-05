exports.up = async function (knex) {
  await knex.schema.createTable('file_uploads', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').nullable().index();
    table.string('bucket', 50).notNullable().index();
    table.string('file_path', 500).notNullable();
    table.string('file_name', 255).notNullable();
    table.string('original_name', 255).notNullable();
    table.string('mime_type', 100).notNullable();
    table.integer('file_size').notNullable();
    table.boolean('is_public').defaultTo(false);
    table.json('metadata').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Índices para consultas comuns
    table.index(['user_id', 'bucket']);
    table.index(['created_at']);
    table.index(['bucket', 'created_at']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('file_uploads');
};
