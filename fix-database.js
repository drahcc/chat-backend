const { Client } = require('pg')

const config = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
}

async function fixDatabase() {
  const client = new Client(config)
  await client.connect()
  
  try {
    // Add admin_id to channels if it doesn't exist
    await client.query(`
      ALTER TABLE channels 
      ADD COLUMN IF NOT EXISTS admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    `)
    console.log('✅ Added admin_id column')
    
    // Mark problematic migrations as completed
    const migrations = [
      '1764796153966_add_is_admin_to_channel_members_schema',
      '1764888844198_messages_schema',
      '1764889526133_channel_bans_schema',
      '1764890380715_add_reason_to_channel_bans_schema',
      '1765128256676_channel_kicks_schema',
      '1765128278417_channel_invites_schema',
      '1765132389799_add_description_to_channels_schema',
      '1765280000000_add_last_message_at_to_channels_schema',
      '1765290000000_add_admin_id_to_channels_schema'
    ]
    
    for (const name of migrations) {
      const exists = await client.query(
        'SELECT 1 FROM adonis_schema WHERE name = $1',
        [name]
      )
      
      if (exists.rows.length === 0) {
        await client.query(`
          INSERT INTO adonis_schema (name, batch, migration_time)
          VALUES ($1, 2, NOW())
        `, [name])
        console.log(`  ✓ Marked ${name}`)
      } else {
        console.log(`  - Already exists: ${name}`)
      }
    }
    console.log('✅ Completed')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

fixDatabase()
