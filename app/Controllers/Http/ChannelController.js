'use strict'

const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')
const ChannelBan = use('App/Models/ChannelBan')

class ChannelController {

  /**
   * GET /channels
   * List all channels with members
   */
  async index() {
    return Channel
      .query()
      .with('members.user')
      .fetch()
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
        is_admin: false
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
   */
  async cleanup() {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)

    const deleted = await Channel
      .query()
      .where('last_message_at', '<', cutoff)
      .delete()

    return { success: true, deleted }
  }
}

module.exports = ChannelController
