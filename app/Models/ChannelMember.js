'use strict'

const Model = use('Model')

class ChannelMember extends Model {
  user () {
    return this.belongsTo('App/Models/User', 'user_id', 'id')
  }

  channel () {
    return this.belongsTo('App/Models/Channel', 'channel_id', 'id')
  }
}

module.exports = ChannelMember
