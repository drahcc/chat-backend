'use strict'

const User = use('App/Models/User')

class AuthController {

  // Регистрация
  async register({ request, auth, response }) {
    try {
      const data = request.only(['email', 'password', 'username'])

      if (!data.username) {
        return response.status(400).json({
          message: "Username is required"
        })
      }

      const user = await User.create(data)

      const token = await auth.generate(user)

      return response.status(201).json({
        message: 'Registration successful',
        token,
        user
      })
    } catch (error) {
      console.error('REGISTER ERROR:', error)
      return response.status(400).json({
        message: 'Registration failed',
        error: error.message
      })
    }
  }

  // Логин
  async login({ request, auth, response }) {
    try {
      const { email, password } = request.only(['email', 'password'])

      const token = await auth.attempt(email, password)
      const user = await User.findBy('email', email)

      return response.json({
        message: 'Login successful',
        token,
        user
      })
    } catch (error) {
      console.error('LOGIN ERROR:', error)
      return response.status(401).json({
        message: 'Invalid email or password'
      })
    }
  }

  // Update notification preference
  async updateNotificationPreference({ request, auth, response }) {
    try {
      const user = await auth.getUser()
      const { preference } = request.only(['preference'])

      if (!['all', 'mentions_only'].includes(preference)) {
        return response.status(400).json({
          message: 'Invalid preference. Must be "all" or "mentions_only"'
        })
      }

      user.notification_preference = preference
      await user.save()

      return response.json({
        message: 'Notification preference updated',
        user
      })
    } catch (error) {
      console.error('UPDATE PREFERENCE ERROR:', error)
      return response.status(500).json({
        message: 'Failed to update preference'
      })
    }
  }

  // Get current user
  async me({ auth, response }) {
    try {
      const user = await auth.getUser()
      return response.json({ user })
    } catch (error) {
      return response.status(401).json({
        message: 'Not authenticated'
      })
    }
  }
}

module.exports = AuthController
