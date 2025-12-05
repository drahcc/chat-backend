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
      owner_id: user.id,
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

    if (channel.owner_id !== user.id) {
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

    if (channel.owner_id !== user.id) {
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

    if (channel.owner_id !== user.id) {
      return { error: 'Only owner can see ban list' }
    }

    return ChannelBan
      .query()
      .where('channel_id', channel.id)
      .with('user')
      .fetch()
  }
}

module.exports = ChannelController
