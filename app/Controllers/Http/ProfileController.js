'use strict'

const User = use('App/Models/User')
const Helpers = use('Helpers')
const Drive = use('Drive')

class ProfileController {
  // Get user profile
  async show ({ params, response }) {
    try {
      const userId = params.id
      const user = await User.query()
        .where('id', userId)
        .select('id', 'username', 'email', 'avatar_url', 'bio', 'display_name', 'status', 'created_at')
        .first()

      if (!user) {
        return response.status(404).json({ error: 'User not found' })
      }

      return response.json({ user })
    } catch (error) {
      console.error('Get profile error:', error)
      return response.status(500).json({ error: 'Failed to get profile' })
    }
  }

  // Update profile
  async update ({ request, auth, response }) {
    try {
      const user = await auth.getUser()
      const { bio, display_name } = request.only(['bio', 'display_name'])

      if (bio !== undefined) user.bio = bio
      if (display_name !== undefined) user.display_name = display_name

      await user.save()

      return response.json({ user })
    } catch (error) {
      console.error('Update profile error:', error)
      return response.status(500).json({ error: 'Failed to update profile' })
    }
  }

  // Upload avatar
  async uploadAvatar ({ request, auth, response }) {
    try {
      const user = await auth.getUser()
      const avatar = request.file('avatar', {
        types: ['image'],
        size: '5mb'
      })

      if (!avatar) {
        return response.status(400).json({ error: 'No avatar file provided' })
      }

      const fileName = `${user.id}_${new Date().getTime()}.${avatar.extname}`
      await avatar.move(Helpers.publicPath('uploads/avatars'), {
        name: fileName,
        overwrite: true
      })

      if (!avatar.moved()) {
        return response.status(500).json({ error: avatar.error() })
      }

      // Update user's avatar URL
      user.avatar_url = `/uploads/avatars/${fileName}`
      await user.save()

      return response.json({ avatar_url: user.avatar_url })
    } catch (error) {
      console.error('Upload avatar error:', error)
      return response.status(500).json({ error: 'Failed to upload avatar' })
    }
  }
}

module.exports = ProfileController
