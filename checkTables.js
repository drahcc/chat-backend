const pg = require('pg');
const client = new pg.Client({ 
  host: '127.0.0.1', 
  port: 5432, 
  user: 'postgres', 
  password: '0341264008v', 
  database: 'chat_app_db' 
});

async function check() {
  await client.connect();
  
  // Get all tables
  const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
  console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));
  
  // Check messages table columns
  const msgCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'messages'`);
  console.log('\nMessages columns:', msgCols.rows.map(r => r.column_name).join(', '));
  
  // Check if pinned_messages table exists
  const pinned = tables.rows.find(r => r.table_name === 'pinned_messages');
  console.log('\nPinned messages table exists:', !!pinned);
  
  await client.end();
}

check().catch(e => { console.error(e); process.exit(1); });
