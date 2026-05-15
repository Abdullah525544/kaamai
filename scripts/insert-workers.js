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

const mockWorkers = [
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        full_name: 'Ahmad Khan',
        role: 'worker',
        service_category: 'plumber',
        skills: ['pipe fitting', 'drainage', 'tap repair'],
        experience_years: 5,
        city: 'Lahore',
        area: 'Model Town',
        rating: 4.7,
        available: true
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        full_name: 'Bilal Ustad',
        role: 'worker',
        service_category: 'plumber',
        skills: ['bathroom installation', 'pipe fitting'],
        experience_years: 3,
        city: 'Lahore',
        area: 'Gulberg',
        rating: 4.3,
        available: true
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        full_name: 'Malik Electric',
        role: 'worker',
        service_category: 'electrician',
        skills: ['wiring', 'panel repair'],
        experience_years: 6,
        city: 'Lahore',
        area: 'Model Town',
        rating: 4.5,
        available: true
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        full_name: 'Usman Carpenter',
        role: 'worker',
        service_category: 'carpenter',
        skills: ['furniture', 'doors', 'woodwork'],
        experience_years: 8,
        city: 'Lahore',
        area: 'DHA',
        rating: 4.6,
        available: true
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        full_name: 'Hassan Painter',
        role: 'worker',
        service_category: 'painter',
        skills: ['interior', 'exterior', 'waterproofing'],
        experience_years: 4,
        city: 'Lahore',
        area: 'Johar Town',
        rating: 4.4,
        available: true
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        full_name: 'Kamran AC Tech',
        role: 'worker',
        service_category: 'ac technician',
        skills: ['AC repair', 'installation', 'gas filling'],
        experience_years: 5,
        city: 'Lahore',
        area: 'Model Town',
        rating: 4.8,
        available: true
    }
];

async function insertWorkers() {
    console.log('Inserting workers into profiles table...');
    const { error: pError } = await supabase.from('profiles').upsert(mockWorkers.map(w => ({
        id: w.id,
        full_name: w.full_name,
        role: w.role,
        service_category: w.service_category,
        skills: w.skills,
        experience_years: w.experience_years,
        city: w.city,
        area: w.area,
        rating: w.rating,
        available: w.available
    })));

    if (pError) {
        console.error('Error in profiles table:', pError);
    } else {
        console.log('Profiles table updated successfully.');
    }

    console.log('Inserting workers into workers table...');
    const { error: wError } = await supabase.from('workers').upsert(mockWorkers.map(w => ({
        id: w.id,
        name: w.full_name,
        service: w.service_category,
        service_category: w.service_category,
        city: w.city,
        area: w.area,
        rating: w.rating,
        available: w.available,
        skills: w.skills,
        experience_years: w.experience_years
    })));

    if (wError) {
        console.error('Error in workers table:', wError);
    } else {
        console.log('Workers table updated successfully.');
    }
}

insertWorkers();
