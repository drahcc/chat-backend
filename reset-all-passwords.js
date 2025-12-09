const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const config = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
}

async function resetAllPasswords() {
  const client = new Client(config)
  await client.connect()
  
  try {
    // Get all users
    const usersResult = await client.query('SELECT id, email, username FROM users')
    
    console.log(`Found ${usersResult.rows.length} users`)
    
    // Hash password 'password' for all
    const newPassword = 'password'
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    console.log(`🔐 New hashed password: ${hashedPassword}`)
    
    // Update all users
    for (const user of usersResult.rows) {
      await client.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      )
      console.log(`✅ Updated password for: ${user.email} (${user.username})`)
    }
    
    console.log(`\n✅ All passwords reset to: ${newPassword}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

resetAllPasswords()
