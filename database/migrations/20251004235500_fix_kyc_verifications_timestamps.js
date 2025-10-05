exports.up = async function (knex) {
  await knex.schema.alterTable('kyc_verifications', (table) => {
    // Adicionar colunas que estão faltando
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('verified_at');
    table.string('document_type', 20);
    table.string('document_number', 50);
    table.string('verification_method', 50);
    table.string('ip_address', 50);
    table.string('user_agent', 255);
    table.jsonb('device_scan_result');
    table.jsonb('fraud_score_result');
    table.jsonb('face_verification_result');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('kyc_verifications', (table) => {
    table.dropColumn('created_at');
    table.dropColumn('updated_at');
    table.dropColumn('verified_at');
    table.dropColumn('document_type');
    table.dropColumn('document_number');
    table.dropColumn('verification_method');
    table.dropColumn('ip_address');
    table.dropColumn('user_agent');
    table.dropColumn('device_scan_result');
    table.dropColumn('fraud_score_result');
    table.dropColumn('face_verification_result');
  });
};
