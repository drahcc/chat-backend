'use strict'

const Schema = use('Schema')

class AddAdminIdToChannelsSchema extends Schema {
  async up () {
    // Check if admin_id column exists, if not add it
    const hasColumn = await this.db.schema.hasColumn('channels', 'admin_id')
    
    if (!hasColumn) {
      this.table('channels', (table) => {
        table
          .integer('admin_id')
          .unsigned()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE')
          .after('type')
      })
    }
  }

  async down () {
    this.table('channels', (table) => {
      table.dropColumn('admin_id')
    })
  }
}

module.exports = AddAdminIdToChannelsSchema
