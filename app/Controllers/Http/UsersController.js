'use strict'

const User = use('App/Models/User')

class UsersController {
  
  async register({ request, response }) {
    try {
      const data = request.only(['email', 'username', 'password'])

      const user = await User.create(data)

      return response.status(201).json({
        message: 'User created',
        user
      })
    } catch (error) {
      console.error(error)
      return response.status(400).json({ error: 'Registration failed' })
    }
  }

  async login({ request, auth, response }) {
    try {
      const { email, password } = request.only(['email', 'password'])

      // JWT token
      const token = await auth.attempt(email, password)
      const user = await User.findBy('email', email)

      return response.json({
        message: 'Login successful',
        token,
        user
      })

    } catch (error) {
      console.error(error)
      return response.status(401).json({ error: 'Invalid email or password' })
    }
  }

  async updateStatus({ request, auth, response }) {
    try {
      const user = await auth.getUser()
      const { status } = request.only(['status'])

      // Validate status
      const validStatuses = ['online', 'dnd', 'offline']
      if (!validStatuses.includes(status)) {
        return response.status(400).json({ error: 'Invalid status. Must be one of: online, dnd, offline' })
      }

      user.status = status
      user.last_seen = new Date()
      await user.save()

      return response.json({
        success: true,
        status: user.status
      })
    } catch (error) {
      console.error('❌ updateStatus error:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async getAllStatuses({ response }) {
    try {
      const usersCollection = await User.query().fetch()
      const users = usersCollection.toJSON()
      const statuses = {}
      
      users.forEach(user => {
        statuses[user.id] = {
          id: user.id,
          username: user.username,
          status: user.status || 'offline'
        }
      })

      return response.json(statuses)
    } catch (error) {
      console.error('❌ getAllStatuses error:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async updateNotificationPreference({ request, auth, response }) {
    try {
      const user = await auth.getUser()
      const { preference } = request.only(['preference'])

      // Validate preference
      const validPreferences = ['all', 'mentions_only']
      if (!validPreferences.includes(preference)) {
        return response.status(400).json({ error: 'Invalid preference. Must be one of: all, mentions_only' })
      }

      user.notification_preference = preference
      await user.save()

      return response.json({
        success: true,
        notification_preference: user.notification_preference
      })
    } catch (error) {
      console.error('❌ updateNotificationPreference error:', error)
      return response.status(500).json({ error: error.message })
    }
  }

  async getNotificationPreference({ auth, response }) {
    try {
      const user = await auth.getUser()

      return response.json({
        notification_preference: user.notification_preference || 'all'
      })
    } catch (error) {
      console.error('❌ getNotificationPreference error:', error)
      return response.status(500).json({ error: error.message })
    }
  }
}

module.exports = UsersController

