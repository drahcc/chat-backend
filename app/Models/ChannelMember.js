'use strict'

const Model = use('Model')

class ChannelMember extends Model {
  channel() {
  return this.belongsTo('App/Models/Channel')
}

user() {
  return this.belongsTo('App/Models/User')
}

}

module.exports = ChannelMember
