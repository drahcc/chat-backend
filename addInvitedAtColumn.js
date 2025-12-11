const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
});

async function addInvitedAtColumn() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Add invited_at column to channel_members table
    await client.query(`
      ALTER TABLE channel_members 
      ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP DEFAULT NULL;
    `);
    console.log('✅ Added invited_at column to channel_members');

    // Update existing records to set invited_at = created_at for users who didn't create the channel
    await client.query(`
      UPDATE channel_members 
      SET invited_at = created_at 
      WHERE is_admin = false AND invited_at IS NULL;
    `);
    console.log('✅ Updated existing invited members with invited_at timestamp');

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await client.end();
  }
}

addInvitedAtColumn();
