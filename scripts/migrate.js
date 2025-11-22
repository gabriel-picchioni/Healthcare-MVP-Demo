import { initDatabase } from '../server/database/connection.js';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    await initDatabase();
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();