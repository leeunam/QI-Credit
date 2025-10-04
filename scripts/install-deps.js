require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('Testando QI Credit...\n');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Configuração Supabase não encontrada no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('1. Testando Supabase Storage...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Supabase falhou:', error.message);
    } else {
      console.log('Supabase conectado!');
      console.log(`Buckets: ${buckets.map(b => b.name).join(', ')}`);
    }

    const requiredBuckets = ['documents', 'contracts', 'kyc'];
    for (const bucket of requiredBuckets) {
      const exists = buckets.find(b => b.name === bucket);
      if (!exists) {
        await supabase.storage.createBucket(bucket, { public: false });
        console.log(`Bucket '${bucket}' criado`);
      }
    }
    
    console.log('\nTeste concluído! Agora rode: npm run dev');
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

test();