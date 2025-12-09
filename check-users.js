const { Client } = require('pg')

const config = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '0341264008v',
  database: 'chat_app_db'
}

async function checkUsers() {
  const client = new Client(config)
  await client.connect()
  
  try {
    const result = await client.query('SELECT id, email, username FROM users LIMIT 10')
    console.log('Users in database:')
    if (result.rows.length === 0) {
      console.log('  ❌ NO USERS FOUND!')
    } else {
      result.rows.forEach(user => {
        console.log(`  - ${user.email} (username: ${user.username}, id: ${user.id})`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

checkUsers()
