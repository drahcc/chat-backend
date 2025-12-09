const pg = require('pg');
const client = new pg.Client({ 
  host: '127.0.0.1', 
  port: 5432, 
  user: 'postgres', 
  password: '0341264008v', 
  database: 'chat_app_db' 
});

async function addLastSeen() {
  await client.connect();
  
  try {
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE');
    console.log('✅ last_seen column added');
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  const userCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
  console.log('Users columns:', userCols.rows.map(r => r.column_name).join(', '));
  
  await client.end();
}

addLastSeen().catch(e => console.error(e));
