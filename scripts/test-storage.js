const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Storage Connection...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    console.log('Testing bucket listing...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Failed to list buckets:', bucketsError.message);
      return;
    }
    
    console.log('Successfully connected to Supabase Storage');
    console.log(`Available buckets: ${buckets.map(b => b.name).join(', ')}`);
    
    if (buckets.length === 0) {
      console.log('\nNo buckets found. Creating test bucket...');
      const { error: createError } = await supabase.storage.createBucket('test-bucket', {
        public: false
      });
      
      if (createError) {
        console.error('Failed to create bucket:', createError.message);
      } else {
        console.log('Test bucket created successfully');
      }
    }
    
    console.log('\nAll storage tests passed!');
    
  } catch (error) {
    console.error('Storage test failed:', error.message);
  }
}

testStorage();