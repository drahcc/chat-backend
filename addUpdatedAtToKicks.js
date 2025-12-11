const { Client } = require('pg')

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
})

async function addUpdatedAt() {
  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Add updated_at to channel_kicks
    await client.query(`
      ALTER TABLE channel_kicks 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `)
    console.log('✅ Added updated_at to channel_kicks')

    // Add updated_at to channel_invites if missing
    await client.query(`
      ALTER TABLE channel_invites 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `)
    console.log('✅ Added updated_at to channel_invites')

    await client.end()
    console.log('✅ Done!')
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

addUpdatedAt()
