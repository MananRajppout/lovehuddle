import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('✗ DATABASE_URL not found in .env file!');
    console.log('');
    console.log('Add this to your .env file:');
    console.log('DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres');
    console.log('');
    console.log('Find it in: Supabase Dashboard → Settings → Database → Connection string → URI');
    process.exit(1);
}

async function setup() {
    const client = new pg.Client({ connectionString: DATABASE_URL });

    try {
        console.log('Connecting to Supabase database...');
        await client.connect();
        console.log('✓ Connected!\n');

        const sql = readFileSync(join(__dirname, '..', 'supabase-setup.sql'), 'utf-8');
        await client.query(sql);

        console.log('✓ Tables created successfully!');
        console.log('✓ 4 default blog posts seeded!');
        console.log('\n🎉 Database setup complete! You can now run: npm run dev');
    } catch (err) {
        console.error('✗ Setup failed:', err.message);
    } finally {
        await client.end();
    }
}

setup();
