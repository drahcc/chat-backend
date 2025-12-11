'use strict'

const Message = use('App/Models/Message')
const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const User = use('App/Models/User')
const ChannelBan = use('App/Models/ChannelBan')
const ChannelKick = use('App/Models/ChannelKick')
const ChannelInvite = use('App/Models/ChannelInvite')

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
  async send({ params, request, auth, response }) {
    try {
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

      // preload user for frontend display
      await message.load('user')

      return { success: true, message: message.toJSON() }
    } catch (error) {
      console.error('❌ Error in send():', error)
      return response.status(500).json({ 
        error: error.message || 'Internal server error' 
      })
    }
  }

  // ============================
  // SEND COMMAND (No channel context)
  // ============================
  async sendCommand({ request, auth, response }) {
    console.log('📥 sendCommand called with:', request.all())
    
    try {
      const user = await auth.getUser()
      const content = request.input('content')

      if (!content || !content.startsWith('/')) {
        return response.status(400).json({ error: 'Invalid command' })
      }

      const result = await this.handleCommand(content, user, null)
      return response.json(result)
    } catch (error) {
      console.error('❌ sendCommand error:', error.message)
      return response.status(500).json({ error: error.message })
    }
  }

  // ============================
  // COMMAND ROUTER
  // ============================
  async handleCommand(content, user, channelId) {
    const parts = content.trim().split(' ')
    const command = parts[0]

    switch (command) {
      case '/help':
        return await this.commandHelp()

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

      case '/revoke':
        return await this.commandRevoke(parts, channelId, user)

      case '/unban':
        return await this.commandUnban(parts, channelId, user)

      default:
        return { error: 'Unknown command. Type /help to see available commands.' }
    }
  }

  // ============================
  // /help - Show all commands
  // ============================
  async commandHelp() {
    const helpText = `**Available Commands:**

📝 **Channel Management**
• \`/join channelName [private]\` - Join existing channel or create new one
• \`/cancel\` or \`/quit\` - Leave current channel
• \`/list\` - Show all members in current channel

👥 **User Management**
• \`/invite @username\` - Invite user to current channel
• \`/kick @username [reason]\` - Remove user from channel (admin only)
• \`/revoke @username\` - Cancel pending invitation (admin only)
• \`/unban @username\` - Unban user from channel (admin only)

ℹ️ **Other**
• \`/help\` - Show this help message

**Example:**
\`/join general\` - Join or create channel "general"
\`/invite @john\` - Invite user "john" to current channel`

    return { 
      success: true, 
      is_help: true,
      content: helpText 
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

    // private → check for invitation
    if (channel.type === 'private') {
      const invite = await ChannelInvite
        .query()
        .where('channel_id', channel.id)
        .where('receiver_id', user.id)
        .where('status', 'pending')
        .first()

      if (!invite) {
        return { error: 'This channel is private. You need an invitation.' }
      }

      // Accept the invite
      invite.status = 'accepted'
      await invite.save()

      // Add to members
      await ChannelMember.create({
        channel_id: channel.id,
        user_id: user.id,
        is_admin: false
      })

      return { success: true, joined: true, via_invite: true, channel }
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
      user_id: target.id,
      invited_at: new Date()  // Set invited_at when inviting
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

    const username = parts[1].replace('@', '') // Remove @ if present

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

    // Track the kick
    await ChannelKick.create({
      channel_id: channelId,
      user_id: target.id,
      kicked_by: user.id
    })

    // Count total kicks for this user in this channel
    const kickCount = await ChannelKick
      .query()
      .where('channel_id', channelId)
      .where('user_id', target.id)
      .count('* as total')

    const totalKicks = kickCount[0].total

    // If 3 or more kicks, auto-ban
    if (totalKicks >= 3) {
      await ChannelBan.create({
        channel_id: channelId,
        user_id: target.id,
        reason: 'Automatic ban after 3 kicks'
      })
    }

    // Remove from channel
    await member.delete()

    // NOTE: Socket.IO notification will be sent from frontend after successful kick

    return {
      success: true,
      kicked: true,
      message: `Successfully kicked ${username}. Total kicks: ${totalKicks}${totalKicks >= 3 ? ' (User is now banned)' : ''}`,
      user: username,
      userId: target.id,
      channelId: channelId,
      kick_count: totalKicks,
      banned: totalKicks >= 3
    }
  }

  // ============================
  // /revoke username - remove from private channel invites
  // ============================
  async commandRevoke(parts, channelId, user) {
    if (parts.length < 2) {
      return { error: 'Usage: /revoke username' }
    }

    const username = parts[1]
    const channel = await Channel.find(channelId)

    if (!channel) {
      return { error: 'Channel not found' }
    }

    // Only admin can revoke
    const admin = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!admin || !admin.is_admin) {
      return { error: 'Only admins can revoke invites' }
    }

    const target = await User.findBy('username', username)
    if (!target) {
      return { error: 'User not found' }
    }

    // Remove from channel if member
    const member = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', target.id)
      .first()

    if (member) {
      await member.delete()
    }

    return {
      success: true,
      revoked: true,
      user: username
    }
  }

  // ============================
  // /unban username - admin unban user
  // ============================
  async commandUnban(parts, channelId, user) {
    if (parts.length < 2) {
      return { error: 'Usage: /unban username' }
    }

    const username = parts[1]
    const channel = await Channel.find(channelId)

    if (!channel) {
      return { error: 'Channel not found' }
    }

    // Only admin can unban
    const admin = await ChannelMember
      .query()
      .where('channel_id', channelId)
      .where('user_id', user.id)
      .first()

    if (!admin || !admin.is_admin) {
      return { error: 'Only admins can unban users' }
    }

    const target = await User.findBy('username', username)
    if (!target) {
      return { error: 'User not found' }
    }

    // Remove ban
    const ban = await ChannelBan
      .query()
      .where('channel_id', channelId)
      .where('user_id', target.id)
      .first()

    if (!ban) {
      return { error: 'User is not banned' }
    }

    await ban.delete()

    // Also clear kick history
    await ChannelKick
      .query()
      .where('channel_id', channelId)
      .where('user_id', target.id)
      .delete()

    return {
      success: true,
      unbanned: true,
      user: username
    }
  }

  // ============================
  // EDIT MESSAGE
  // ============================
  async edit({ params, request, auth, response }) {
    try {
      const user = await auth.getUser()
      const messageId = params.id
      const { content } = request.only(['content'])

      if (!content || content.trim() === '') {
        return response.status(400).json({ error: 'Message content cannot be empty' })
      }

      const message = await Message.find(messageId)
      if (!message) {
        return response.status(404).json({ error: 'Message not found' })
      }

      if (message.user_id !== user.id) {
        return response.status(403).json({ error: 'You can only edit your own messages' })
      }

      message.content = content
      message.is_edited = true
      message.edited_at = new Date()
      await message.save()

      await message.load('user')

      return response.json({ success: true, message })
    } catch (error) {
      console.error('Edit message error:', error)
      return response.status(500).json({ error: 'Failed to edit message' })
    }
  }

  // ============================
  // DELETE MESSAGE
  // ============================
  async delete({ params, auth, response }) {
    try {
      const user = await auth.getUser()
      const messageId = params.id

      const message = await Message.find(messageId)
      if (!message) {
        return response.status(404).json({ error: 'Message not found' })
      }

      if (message.user_id !== user.id) {
        return response.status(403).json({ error: 'You can only delete your own messages' })
      }

      message.is_deleted = true
      message.deleted_at = new Date()
      message.content = '[Message deleted]'
      await message.save()

      return response.json({ success: true, message })
    } catch (error) {
      console.error('Delete message error:', error)
      return response.status(500).json({ error: 'Failed to delete message' })
    }
  }

  // ============================
  // SEARCH MESSAGES
  // ============================
  async search({ params, request, response }) {
    try {
      const channelId = params.channelId
      const query = request.input('q', '')
      const page = request.input('page', 1)

      if (!query || query.trim() === '') {
        return response.status(400).json({ error: 'Search query is required' })
      }

      const messages = await Message
        .query()
        .where('channel_id', channelId)
        .where('is_deleted', false)
        .where('content', 'LIKE', `%${query}%`)
        .with('user')
        .orderBy('created_at', 'desc')
        .paginate(page, 25)

      return response.json({ messages })
    } catch (error) {
      console.error('Search messages error:', error)
      return response.status(500).json({ error: 'Failed to search messages' })
    }
  }

}

module.exports = MessageController
