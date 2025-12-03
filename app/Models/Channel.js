'use strict'

const Model = use('Model')

class Channel extends Model {
  members() {
  return this.hasMany('App/Models/ChannelMember')
}

}

module.exports = Channel
