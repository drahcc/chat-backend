const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const config = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
}

async function resetPassword() {
  const client = new Client(config)
  await client.connect()
  
  try {
    // Hash a new password
    const newPassword = 'password'
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    console.log(`🔐 New hashed password: ${hashedPassword}`)
    
    // Update test user
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, username',
      [hashedPassword, 'test123@test.com']
    )
    
    if (result.rowCount > 0) {
      console.log(`✅ Password reset for: ${result.rows[0].email} (${result.rows[0].username})`)
      console.log(`   New password: ${newPassword}`)
    } else {
      console.log('❌ User not found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

resetPassword()
