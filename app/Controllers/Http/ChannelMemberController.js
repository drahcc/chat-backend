'use strict'

const ChannelMember = use('App/Models/ChannelMember')
const ChannelBan = use('App/Models/ChannelBan')

class ChannelMemberController {

  // ===========================
  // JOIN CHANNEL (with ban check)
  // ===========================
  async join({ params, auth }) {
    const user = await auth.getUser()
    const channelId = params.id

    // Check if user is banned
    const isBanned = await ChannelBan
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (isBanned) {
      return {
        error: 'You are banned from this channel',
        reason: isBanned.reason
      }
    }

    // Check if already a member
    const exists = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (exists) {
      return { message: 'Already a member' }
    }

    // Create membership
    await ChannelMember.create({
      channel_id: channelId,
      user_id: user.id
    })

    return { success: true, message: 'Joined channel' }
  }
}

module.exports = ChannelMemberController
