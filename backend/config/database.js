const knex = require('knex');
const config = require('./config');
const { supabase } = require('./supabase');

const knexConfig = {
  client: 'postgresql',
  connection: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    ssl: { rejectUnauthorized: false }, // Sempre SSL para Supabase
  },
  migrations: {
    directory: require('path').join(__dirname, '../../database/migrations'),
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: require('path').join(__dirname, '../../database/seeders'),
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 600000,
    createTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  // Otimizações para Supabase PostgreSQL
  asyncStackTraces: process.env.NODE_ENV === 'development',
  debug:
    process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true',
};

const db = knex(knexConfig);

db.raw('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

async function testStorageConnection() {
  try {
    if (!supabase) {
      console.log('Supabase Storage in mock mode');
      return;
    }

    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Supabase Storage connection failed:', error.message);
    } else {
      console.log('Supabase Storage connected successfully');
      console.log(`Available buckets: ${data.map((b) => b.name).join(', ')}`);
    }
  } catch (err) {
    console.error('Supabase Storage connection failed:', err.message);
  }
}

testStorageConnection();

module.exports = db;
