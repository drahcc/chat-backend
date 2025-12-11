const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
});

async function addNotificationPreference() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Add notification_preference column to users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS notification_preference VARCHAR(20) DEFAULT 'all';
    `);
    console.log('✅ Added notification_preference column to users table');

    // Add comment to explain the column
    await client.query(`
      COMMENT ON COLUMN users.notification_preference IS 'Values: all or mentions_only';
    `);
    console.log('✅ Added column comment');

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await client.end();
  }
}

addNotificationPreference();
