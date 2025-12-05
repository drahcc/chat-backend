'use strict'

const Message = use('App/Models/Message')
const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const User = use('App/Models/User')

class MessageController {

  // ============================
  // GET MESSAGES (history)
  // ============================
  async getMessages({ params, request, auth }) {
    const user = await auth.getUser()
    const channelId = params.channelId

    // check membership
    const isMember = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!isMember) {
      return { error: 'You are not a member of this channel' }
    }

    // pagination (infinite scroll)
    const page = request.input('page', 1)

    const messages = await Message
      .query()
      .where('channel_id', channelId)
      .with('user')
      .orderBy('created_at', 'desc')
      .paginate(page, 25)

    return messages
  }

  // ============================
  // SEND MESSAGE
  // ============================
  async send({ params, request, auth }) {
    const user = await auth.getUser()
    const channelId = params.channelId
    const content = request.input('content')

    if (!content || content.trim() === '') {
      return { error: 'Message cannot be empty' }
    }

    // check membership
    const isMember = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!isMember) {
      return { error: 'You are not a member of this channel' }
    }

    // detect if command: /join /kick /invite ...
    const isCommand = content.startsWith('/')

    // detect @mention
    let mentionedUserId = null
    const mentionMatch = content.match(/@([A-Za-z0-9_]+)/)

    if (mentionMatch) {
      const username = mentionMatch[1]
      const mentionedUser = await User.findBy('username', username)
      if (mentionedUser) {
        mentionedUserId = mentionedUser.id
      }
    }

    // create message
    const message = await Message.create({
      channel_id: channelId,
      user_id: user.id,
      content,
      is_command: isCommand,
      mentioned_user_id: mentionedUserId
    })

    return {
      success: true,
      message
    }
  }

}

module.exports = MessageController
