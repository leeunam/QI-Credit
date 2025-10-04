const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabase =
  config.supabase.url &&
  config.supabase.serviceRoleKey &&
  !config.supabase.mockMode
    ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

if (supabase) {
  console.log('✅ Supabase client initialized');
} else {
  console.log('⚠️  Supabase running in mock mode');
}

module.exports = { supabase };
