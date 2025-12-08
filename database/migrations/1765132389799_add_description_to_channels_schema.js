'use strict'

const Schema = use('Schema')

class AddDescriptionToChannelsSchema extends Schema {
  up () {
    this.table('channels', (table) => {
      table.string('description').nullable()
    })
  }

  down () {
    this.table('channels', (table) => {
      table.dropColumn('description')
    })
  }
}

module.exports = AddDescriptionToChannelsSchema
