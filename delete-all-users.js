const { Client } = require('pg')

async function deleteAllUsers() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '0341264008v',
    database: 'chat_app_db'
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // First, get count of users
    const countResult = await client.query('SELECT COUNT(*) FROM users')
    console.log(`Found ${countResult.rows[0].count} users`)

    // Delete all messages (foreign key constraint)
    await client.query('DELETE FROM messages')
    console.log('✅ Deleted all messages')

    // Delete all channel members (foreign key constraint)
    await client.query('DELETE FROM channel_members')
    console.log('✅ Deleted all channel members')

    // Delete all channel bans (foreign key constraint)
    await client.query('DELETE FROM channel_bans')
    console.log('✅ Deleted all channel bans')

    // Delete all channel kicks (foreign key constraint)
    const kicksTableExists = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'channel_kicks')"
    )
    if (kicksTableExists.rows[0].exists) {
      await client.query('DELETE FROM channel_kicks')
      console.log('✅ Deleted all channel kicks')
    }

    // Delete all channel invites (foreign key constraint)
    const invitesTableExists = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'channel_invites')"
    )
    if (invitesTableExists.rows[0].exists) {
      await client.query('DELETE FROM channel_invites')
      console.log('✅ Deleted all channel invites')
    }

    // Delete all channels (foreign key constraint)
    await client.query('DELETE FROM channels')
    console.log('✅ Deleted all channels')

    // Delete all tokens (foreign key constraint)
    await client.query('DELETE FROM tokens')
    console.log('✅ Deleted all tokens')

    // Finally, delete all users
    const deleteResult = await client.query('DELETE FROM users')
    console.log(`✅ Deleted ${deleteResult.rowCount} users`)

    console.log('\n🎉 All users and related data deleted successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

deleteAllUsers()
