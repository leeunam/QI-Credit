#!/usr/bin/env node

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const knex = require('knex');

async function cleanup() {
  const db = knex({
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    },
  });

  try {
    console.log('🧹 Limpando dados de teste...');

    // Delete KYC verifications first (foreign key dependency)
    const kycResult = await db.raw(`
      DELETE FROM kyc_verifications
      WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test-%@example.com')
    `);
    console.log(`✅ Removidos ${kycResult.rowCount || 0} registros de kyc_verifications`);

    // Delete file uploads
    const filesResult = await db.raw(`
      DELETE FROM file_uploads
      WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'test-%@example.com')
    `);
    console.log(`✅ Removidos ${filesResult.rowCount || 0} registros de file_uploads`);

    // Delete users
    const usersResult = await db.raw(`
      DELETE FROM users WHERE email LIKE 'test-%@example.com'
    `);
    console.log(`✅ Removidos ${usersResult.rowCount || 0} usuários de teste`);

    console.log('✅ Limpeza concluída!');
  } catch (error) {
    console.error('❌ Erro na limpeza:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

cleanup();
