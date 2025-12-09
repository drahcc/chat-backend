const Database = use('Database')

async function checkSchema() {
  try {
    const result = await Database.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'channels' 
      ORDER BY ordinal_position
    `)
    console.log('Channels table columns:')
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`)
    })
  } catch (error) {
    console.error('Error:', error.message)
  }
  process.exit(0)
}

checkSchema()
