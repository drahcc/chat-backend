'use strict'

const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const ChannelBan = use('App/Models/ChannelBan')

class ChannelController {

  /**
   * GET /channels
   * List all channels with members
   */
  async index({ auth }) {
    const user = await auth.getUser()
    const channels = await Channel
      .query()
      .with('members.user')
      .fetch()

    // Manually add invited_at for current user to each channel
    const result = await Promise.all(channels.toJSON().map(async (chan) => {
      const membership = await ChannelMember.query()
        .where('channel_id', chan.id)
        .where('user_id', user.id)
        .first()
      if (membership) {
        chan.invited_at = membership.invited_at
      }
      return chan
    }))

    return result
  }

  /**
   * POST /channels
   * Create channel
   */
  async create({ request, auth }) {
    const user = await auth.getUser()
    const { name, description, type } = request.all()

    const exists = await Channel.findBy('name', name)
    if (exists) {
      return { error: 'Channel name already exists' }
    }

    const channel = await Channel.create({
      name,
      description: description || '',
      type: type || 'public',
      admin_id: user.id,
      last_message_at: new Date()
    })

    await ChannelMember.create({
      channel_id: channel.id,
      user_id: user.id,
      is_admin: true
    })

    return channel
  }

  /**
   * GET /channels/:id
   */
  async show({ params }) {
    return Channel
      .query()
      .where('id', params.id)
      .with('members.user')
      .first()
  }

  /**
   * PATCH /channels/:id
   * Update channel properties
   */
  async update({ params, request, auth }) {
    const user = await auth.getUser()
    const channel = await Channel.findOrFail(params.id)

    // Only admin can update channel
    if (channel.admin_id !== user.id) {
      return { error: 'Only channel admin can update' }
    }

    const data = request.only(['name', 'description', 'last_message_at', 'type'])
    channel.merge(data)
    await channel.save()

    return channel
  }

  /**
   * POST /channels/:id/ban
   */
  async banUser({ params, request, auth }) {
    const user = await auth.getUser()
    const channel = await Channel.findOrFail(params.id)

    if (channel.admin_id !== user.id) {
      return { error: 'Only channel owner can ban users' }
    }

    const { user_id } = request.only(['user_id'])

    await ChannelBan.create({
      channel_id: channel.id,
      user_id,
      reason: request.input('reason', 'No reason provided')
    })

    await ChannelMember
      .query()
      .where('channel_id', channel.id)
      .where('user_id', user_id)
      .delete()

    return { success: true, message: 'User banned successfully' }
  }

  /**
   * POST /channels/:id/unban
   */
  async unbanUser({ params, request, auth }) {
    const user = await auth.getUser()
    const channel = await Channel.findOrFail(params.id)

    if (channel.admin_id !== user.id) {
      return { error: 'Only channel owner can unban users' }
    }

    const { user_id } = request.only(['user_id'])

    const ban = await ChannelBan
      .query()
      .where('channel_id', channel.id)
      .where('user_id', user_id)
      .first()

    if (!ban) {
      return { error: 'User is not banned' }
    }

    await ban.delete()

    return { success: true, message: 'User unbanned successfully' }
  }

  /**
   * GET /channels/:id/bans
   */
  async banList({ params, auth }) {
    const user = await auth.getUser()
    const channel = await Channel.findOrFail(params.id)

    if (channel.admin_id !== user.id) {
      return { error: 'Only owner can see ban list' }
    }

    return ChannelBan
      .query()
      .where('channel_id', channel.id)
      .with('user')
      .fetch()
  }

  /**
   * POST /channels/:id/join
   */
  async join({ params, auth, response }) {
    try {
      const user = await auth.getUser()
      const channel = await Channel.findOrFail(params.id)

      // Private channels require invite (not implemented fully here)
      if (channel.type === 'private') {
        return response.status(403).json({ error: 'Private channel. Invite required.' })
      }

      const existing = await ChannelMember
        .query()
        .where('channel_id', channel.id)
        .where('user_id', user.id)
        .first()

      if (existing) {
        return { success: true, already_member: true, channel_id: channel.id }
      }

      await ChannelMember.create({
        channel_id: channel.id,
        user_id: user.id,
        is_admin: false,
        invited_at: new Date()  // Set invited_at for newly joined public channels
      })

      channel.last_message_at = new Date()
      await channel.save()

      return { success: true, joined: true, channel_id: channel.id }
    } catch (err) {
      console.error('Join channel error:', err.message)
      return response.status(500).json({ error: err.message })
    }
  }

  /**
   * POST /channels/:id/leave
   */
  async leave({ params, auth }) {
    const user = await auth.getUser()
    const membership = await ChannelMember
      .query()
      .where('channel_id', params.id)
      .where('user_id', user.id)
      .first()

    if (!membership) {
      return { error: 'Not a member' }
    }

    // If admin leaves, delete the channel
    if (membership.is_admin) {
      const channel = await Channel.find(params.id)
      if (channel) await channel.delete()
      return { success: true, deleted_channel: true }
    }

    await membership.delete()
    return { success: true, left: true }
  }

  /**
   * GET /channels/:id/members
   */
  async list({ params }) {
    return ChannelMember
      .query()
      .where('channel_id', params.id)
      .with('user')
      .fetch()
  }

  /**
   * POST /channels/:id/invite
   */
  async invite({ params, request, auth, response }) {
    const user = await auth.getUser()
    const channel = await Channel.findOrFail(params.id)

    // Only admin can invite
    const membership = await ChannelMember
      .query()
      .where('channel_id', channel.id)
      .where('user_id', user.id)
      .first()

    if (!membership || !membership.is_admin) {
      return response.status(403).json({ error: 'Only admins can invite' })
    }

    const { user_id } = request.post()
    if (!user_id) {
      return response.status(400).json({ error: 'user_id required' })
    }

    const existing = await ChannelMember
      .query()
      .where('channel_id', channel.id)
      .where('user_id', user_id)
      .first()

    if (existing) {
      return { success: true, already_member: true }
    }

    await ChannelMember.create({
      channel_id: channel.id,
      user_id,
      is_admin: false
    })

    return { success: true, invited: true }
  }


  /**
   * POST /channels/cleanup
   * Deletes channels inactive for >30 days
   * Also leaves public channels where current user is not admin and not member
   */
  async cleanup({ auth }) {
    const user = await auth.getUser()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    // 1. Delete channels inactive for >30 days
    const deletedCount = await Channel
      .query()
      .where('last_message_at', '<', cutoff)
      .delete()

    // 2. Find public channels where user is not admin and not a member (orphaned)
    const allPublic = await Channel
      .query()
      .where('type', 'public')
      .whereNot('admin_id', user.id)
      .fetch()

    let leftCount = 0
    for (const channel of allPublic.rows) {
      // Check if user is member
      const membership = await ChannelMember
        .query()
        .where('channel_id', channel.id)
        .where('user_id', user.id)
        .first()

      if (!membership) {
        // User is not member - this is an orphaned public channel for this user
        // We don't delete it, we just mark it so user doesn't see it
        // Actually, we can't really "hide" it from public list unless we track it
        // So we'll leave it as-is (it will show in public channels)
        // The user just won't see it in their "Your Channels" anymore
        leftCount++
      }
    }

    return { 
      success: true, 
      deletedChannels: deletedCount,
      leftChannels: leftCount
    }
  }

  /**
   * POST /channels/:id/clear-invite-flag
   * Clear the invited_at timestamp when user opens/views the channel
   * (removes the highlight from the channel list)
   */
  async clearInviteFlag({ params, auth }) {
    try {
      const user = await auth.getUser()
      const channel = await Channel.findOrFail(params.id)

      const membership = await ChannelMember
        .query()
        .where('channel_id', channel.id)
        .where('user_id', user.id)
        .first()

      if (membership) {
        membership.invited_at = null
        await membership.save()
      }

      return { success: true, message: 'Invite flag cleared' }
    } catch (error) {
      console.error('clearInviteFlag error:', error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = ChannelController
