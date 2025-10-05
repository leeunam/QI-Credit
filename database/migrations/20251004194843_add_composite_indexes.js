/**
 * Migration: Add Composite Indexes
 * Purpose: Optimize common query patterns with composite indexes
 * Created: 2025-10-04
 */

exports.up = async function(knex) {
  // Add composite index on loan_contracts for borrower queries
  await knex.schema.alterTable('loan_contracts', (table) => {
    table.index(['borrower_id', 'status'], 'idx_loans_borrower_status');
  });

  // Add composite index on file_uploads for user file listings
  await knex.schema.alterTable('file_uploads', (table) => {
    table.index(['user_id', 'created_at'], 'idx_files_user_created');
  });

  // Add composite index on repayments for loan payment queries
  await knex.schema.alterTable('repayments', (table) => {
    table.index(['loan_id', 'status'], 'idx_repayments_loan_status');
  });

  // Add composite index on transactions for account transaction history
  await knex.schema.alterTable('transactions', (table) => {
    table.index(['digital_account_id', 'created_at'], 'idx_transactions_account_created');
  });

  // Add composite index on credit_analyses for user credit analysis queries
  await knex.schema.alterTable('credit_analyses', (table) => {
    table.index(['user_id', 'status'], 'idx_credit_analyses_user_status');
  });

  console.log('Composite indexes created successfully');
};

exports.down = async function(knex) {
  // Drop composite indexes in reverse order
  await knex.schema.alterTable('credit_analyses', (table) => {
    table.dropIndex(['user_id', 'status'], 'idx_credit_analyses_user_status');
  });

  await knex.schema.alterTable('transactions', (table) => {
    table.dropIndex(['digital_account_id', 'created_at'], 'idx_transactions_account_created');
  });

  await knex.schema.alterTable('repayments', (table) => {
    table.dropIndex(['loan_id', 'status'], 'idx_repayments_loan_status');
  });

  await knex.schema.alterTable('file_uploads', (table) => {
    table.dropIndex(['user_id', 'created_at'], 'idx_files_user_created');
  });

  await knex.schema.alterTable('loan_contracts', (table) => {
    table.dropIndex(['borrower_id', 'status'], 'idx_loans_borrower_status');
  });

  console.log('Composite indexes dropped successfully');
};
