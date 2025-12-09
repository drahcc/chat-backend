'use strict'

const Schema = use('Schema')

class AddIsAdminToChannelMembersSchema extends Schema {
  async up () {
    const hasColumn = await this.db.schema.hasColumn('channel_members', 'is_admin')
    
    if (!hasColumn) {
      this.table('channel_members', (table) => {
        table.boolean('is_admin').defaultTo(false)
      })
    }
  }

  down () {
    this.table('channel_members', (table) => {
      table.dropColumn('is_admin')
    })
  }
}

module.exports = AddIsAdminToChannelMembersSchema
