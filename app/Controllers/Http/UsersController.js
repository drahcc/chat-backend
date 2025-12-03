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
}

module.exports = UsersController
