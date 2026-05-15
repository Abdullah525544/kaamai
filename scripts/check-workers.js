const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkWorkers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker');

    if (error) {
        console.error('Error fetching workers:', error);
    } else {
        console.log('Found workers:', JSON.stringify(data, null, 2));
    }
}

checkWorkers();
