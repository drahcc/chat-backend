const pg = require('pg');
const client = new pg.Client({ 
  host: '127.0.0.1', 
  port: 5432, 
  user: 'postgres', 
  password: '0341264008v', 
  database: 'chat_app_db' 
});

async function addMissingTables() {
  await client.connect();
  
  console.log('Adding missing columns and tables...');
  
  // Add missing columns to messages table
  try {
    await client.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE
    `);
    console.log('✅ Messages columns added');
  } catch (e) {
    console.log('Messages columns:', e.message);
  }
  
  // Add status column to users table
  try {
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'offline',
      ADD COLUMN IF NOT EXISTS notification_preference VARCHAR(20) DEFAULT 'all'
    `);
    console.log('✅ Users columns added');
  } catch (e) {
    console.log('Users columns:', e.message);
  }
  
  // Create pinned_messages table
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS pinned_messages (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
        channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
        pinned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(message_id, channel_id)
      )
    `);
    console.log('✅ Pinned messages table created');
  } catch (e) {
    console.log('Pinned messages table:', e.message);
  }
  
  // Create message_reactions table
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_reactions (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        emoji VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(message_id, user_id, emoji)
      )
    `);
    console.log('✅ Message reactions table created');
  } catch (e) {
    console.log('Message reactions table:', e.message);
  }
  
  // Create message_reads table
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_reads (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(message_id, user_id)
      )
    `);
    console.log('✅ Message reads table created');
  } catch (e) {
    console.log('Message reads table:', e.message);
  }
  
  // Create file_attachments table
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS file_attachments (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100),
        size INTEGER,
        path VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ File attachments table created');
  } catch (e) {
    console.log('File attachments table:', e.message);
  }
  
  // Verify tables
  const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  console.log('\n📊 All tables:', tables.rows.map(r => r.table_name).join(', '));
  
  const msgCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'messages'`);
  console.log('📊 Messages columns:', msgCols.rows.map(r => r.column_name).join(', '));
  
  const userCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
  console.log('📊 Users columns:', userCols.rows.map(r => r.column_name).join(', '));
  
  await client.end();
  console.log('\n✅ Database update complete!');
}

addMissingTables().catch(e => { console.error('Error:', e); process.exit(1); });
