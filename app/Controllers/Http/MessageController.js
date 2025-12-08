'use strict'

const Message = use('App/Models/Message')
const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const User = use('App/Models/User')

class MessageController {

  // ============================
  // GET MESSAGES (History)
  // ============================
  async getMessages({ params, request, auth }) {
    const user = await auth.getUser()
    const channelId = params.channelId

    // Check membership
    const isMember = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!isMember) {
      return { error: 'You are not a member of this channel' }
    }

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

    // If command → process it
    if (content.startsWith('/')) {
      return await this.handleCommand(content, user, channelId)
    }

    // Must be member for normal message
    const isMember = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!isMember) {
      return { error: 'You are not a member of this channel' }
    }

    // detect @mention
    let mentionedUserId = null
    const match = content.match(/@([A-Za-z0-9_]+)/)

    if (match) {
      const username = match[1]
      const mentionedUser = await User.findBy('username', username)
      if (mentionedUser) {
        mentionedUserId = mentionedUser.id
      }
    }

    const message = await Message.create({
      channel_id: channelId,
      user_id: user.id,
      content,
      is_command: false,
      mentioned_user_id: mentionedUserId
    })

    return { success: true, message }
  }

  // ============================
  // COMMAND ROUTER
  // ============================
  async handleCommand(content, user, channelId) {
    const parts = content.trim().split(' ')
    const command = parts[0]

    switch (command) {
      case '/join':
        return await this.commandJoin(parts, user)

      case '/cancel':
        return await this.commandCancel(channelId, user)

      case '/quit':
        return await this.commandQuit(channelId, user)

      case '/list':
        return await this.commandList(channelId)

      case '/invite':
        return await this.commandInvite(parts, channelId, user)

      case '/kick':
        return await this.commandKick(parts, channelId, user)

      default:
        return { error: 'Unknown command' }
    }
  }

  // ============================
  // /join channelName [private]
  // ============================
  async commandJoin(parts, user) {
    if (parts.length < 2) {
      return { error: 'Usage: /join channelName [private]' }
    }

    const channelName = parts[1]
    const isPrivate = parts[2] === 'private'

    let channel = await Channel.findBy('name', channelName)

    if (!channel) {
      // create channel
      channel = await Channel.create({
        name: channelName,
        type: isPrivate ? 'private' : 'public',
        admin_id: user.id,
        last_message_at: new Date()
      })

      await ChannelMember.create({
        channel_id: channel.id,
        user_id: user.id,
        is_admin: true
      })

      return { success: true, created: true, channel }
    }

    // private → cannot join
    if (channel.type === 'private') {
      return { error: 'This channel is private. You need an invitation.' }
    }

    const exists = await ChannelMember
      .query()
      .where('channel_id', channel.id)
      .where('user_id', user.id)
      .first()

    if (exists) {
      return { success: true, already_member: true, channel }
    }

    // join public
    await ChannelMember.create({
      channel_id: channel.id,
      user_id: user.id
    })

    return { success: true, joined: true, channel }
  }

  // ============================
  // /cancel → leave channel
  // ============================
  async commandCancel(channelId, user) {
    const membership = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!membership) {
      return { error: 'You are not in this channel' }
    }

    // if admin leaves → delete channel
    if (membership.is_admin) {
      const channel = await Channel.find(channelId)
      await channel.delete()
      return { success: true, deleted_channel: true }
    }

    await membership.delete()

    return { success: true, left: true }
  }

  // ============================
  // /quit → admin deletes channel
  // ============================
  async commandQuit(channelId, user) {
    const membership = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!membership || !membership.is_admin) {
      return { error: 'Only the admin can delete the channel' }
    }

    const channel = await Channel.find(channelId)
    await channel.delete()

    return { success: true, deleted: true }
  }

  // ============================
  // /list → list channel members
  // ============================
  async commandList(channelId) {
    const members = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .with('user')
      .fetch()

    return { members }
  }

  // ============================
  // /invite username
  // ============================
  async commandInvite(parts, channelId, user) {
    if (parts.length < 2) {
      return { error: 'Usage: /invite username' }
    }

    const username = parts[1]

    const target = await User.findBy('username', username)
    if (!target) {
      return { error: 'User not found' }
    }

    if (target.id === user.id) {
      return { error: 'You cannot invite yourself' }
    }

    const admin = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!admin || !admin.is_admin) {
      return { error: 'Only admins can invite users' }
    }

    const exists = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', target.id)
      .first()

    if (exists) {
      return { error: 'User is already a member' }
    }

    await ChannelMember.create({
      channel_id: channelId,
      user_id: target.id
    })

    return {
      success: true,
      invited: true,
      user: username
    }
  }

  // ============================
  // /kick username
  // ============================
  async commandKick(parts, channelId, user) {
    if (parts.length < 2) {
      return { error: 'Usage: /kick username' }
    }

    const username = parts[1]

    const target = await User.findBy('username', username)
    if (!target) {
      return { error: 'User not found' }
    }

    if (target.id === user.id) {
      return { error: 'You cannot kick yourself' }
    }

    const admin = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!admin || !admin.is_admin) {
      return { error: 'Only admins can kick users' }
    }

    const member = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', target.id)
      .first()

    if (!member) {
      return { error: 'User is not in this channel' }
    }

    await member.delete()

    return {
      success: true,
      kicked: true,
      user: username
    }
  }

}

module.exports = MessageController
