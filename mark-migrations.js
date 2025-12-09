const Database = require('@adonisjs/lucid/src/Database')
const config = require('./config/database')

async function markMigrationsAsRun() {
  const knex = require('knex')(config.connection.pg)
  
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
  
  for (const migration of migrations) {
    await knex('adonis_schema').insert({
      name: migration,
      batch: 2,
      migration_time: new Date()
    }).onConflict('name').ignore()
  }
  
  console.log('✅ Marked migrations as run')
  await knex.destroy()
  process.exit(0)
}

markMigrationsAsRun().catch(e => {
  console.error(e)
  process.exit(1)
})
