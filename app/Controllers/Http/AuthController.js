'use strict'

const User = use('App/Models/User')

class AuthController {

  async login({ request, auth, response }) {
    try {
      const { email, password } = request.only(['email', 'password'])

      // Проверяваме дали auth.attempt успява
      const token = await auth.attempt(email, password)

      // Намираме потребителя
      const user = await User.findBy('email', email)

      return response.json({
        message: "Login successful",
        token: token,
        user: user
      })

    } catch (error) {
      console.log("LOGIN ERROR:", error)
      return response.status(401).json({
        message: "Invalid email or password"
      })
    }
  }

}

module.exports = AuthController
