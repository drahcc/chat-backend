'use strict'

const Model = use('Model')

class ChannelBan extends Model {
  channel() {
    return this.belongsTo('App/Models/Channel')
  }

  user() {
    return this.belongsTo('App/Models/User')
  }

  bannedBy() {
    return this.belongsTo('App/Models/User', 'banned_by', 'id')
  }
}

module.exports = ChannelBan
