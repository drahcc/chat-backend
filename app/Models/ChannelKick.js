'use strict'

const Model = use('Model')

class ChannelKick extends Model {
  channel() {
    return this.belongsTo('App/Models/Channel')
  }

  user() {
    return this.belongsTo('App/Models/User', 'user_id', 'id')
  }

  kickedBy() {
    return this.belongsTo('App/Models/User', 'kicked_by', 'id')
  }
}

module.exports = ChannelKick
