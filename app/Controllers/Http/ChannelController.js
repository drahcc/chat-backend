'use strict'

const Channel = use('App/Models/Channel')
const ChannelMember = use('App/Models/ChannelMember')

class ChannelController {
  async index() {
    return await Channel
      .query()
      .with('members.user')
      .fetch()
  }

  async create({ request, auth }) {
    const user = await auth.getUser()
    const { name, description, type } = request.all()

    // Prevent duplicate channel names
    const exists = await Channel.findBy('name', name)
    if (exists) {
      return { error: 'Channel name already exists' }
    }

    const channel = await Channel.create({
      name,
      description: description || '',
      type: type || 'public',
      admin: user.id,
    })

    // Add creator as admin member
    await ChannelMember.create({
      channel_id: channel.id,
      user_id: user.id,
      is_admin: true
    })

    return channel
  }

  async show({ params }) {
    const channel = await Channel
      .query()
      .where('id', params.id)
      .with('members.user')
      .first()

    return channel
  }

  async delete({ params, auth }) {
    const channel = await Channel.findOrFail(params.id)
    const user = await auth.getUser()

    if (channel.admin !== user.id) {
      return { error: 'Only the channel admin can delete the channel' }
    }

    await ChannelMember
      .query()
      .where('channel_id', params.id)
      .delete()

    await channel.delete()

    return { success: true, message: 'Channel deleted' }
  }
}

module.exports = ChannelController
