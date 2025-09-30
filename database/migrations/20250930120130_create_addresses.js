// Migration: create_addresses

exports.up = async function (knex) {
  await knex.schema.createTable('addresses', (table) => {
    table.uuid('id').primary();
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('street', 160);
    table.string('number', 32);
    table.string('complement', 64);
    table.string('neighborhood', 80);
    table.string('city', 80);
    table.string('state', 32);
    table.string('postal_code', 20);
    table.string('country', 32);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.index(['user_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('addresses');
};
