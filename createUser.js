const { ioc } = require('@adonisjs/fold')
const Helpers = ioc.use('Adonis/Src/Helpers')
const path = require('path')

// Зарежда AdonisJS приложението
require(path.join(Helpers.appRoot(), 'start/app'))

const User = ioc.use('App/Models/User')

async function createUser() {
  try {
    const user = await User.create({
      email: 'test@example.com',
      password: '123456' // ще се хешира автоматично
    })

    console.log('User created:', user.email)
  } catch (err) {
    console.error(err)
  }

  process.exit()
}

createUser()