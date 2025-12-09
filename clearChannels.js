'use strict'

const { ioc } = require('@adonisjs/fold')
const path = require('path')

// Bootstrap Adonis
const appRoot = path.join(__dirname)
require(path.join(appRoot, 'node_modules/@adonisjs/ignitor/src/Helpers'))
const fold = require('@adonisjs/fold')
const registrar = new (require('@adonisjs/fold/src/Registrar'))()

async function main() {
  try {
    // Register core providers
    fold.ioc.bind('Adonis/Src/Helpers', () => {
      return { appRoot: () => appRoot }
    })
    
    const Env = require(path.join(appRoot, 'node_modules/@adonisjs/framework/src/Env'))
    const env = new Env(appRoot)
    fold.ioc.singleton('Adonis/Src/Env', () => env)
    
    const Config = require(path.join(appRoot, 'node_modules/@adonisjs/framework/src/Config'))
    const config = new Config(path.join(appRoot, 'config'))
    fold.ioc.singleton('Adonis/Src/Config', () => config)
    
    // Setup database
    const Database = require(path.join(appRoot, 'node_modules/@adonisjs/lucid/src/Database/Manager'))
    const db = new Database(config)
    fold.ioc.singleton('Adonis/Src/Database', () => db)
    
    // Delete all data
    console.log('Deleting channel_members...')
    await db.table('channel_members').delete()
    
    console.log('Deleting messages...')
    await db.table('messages').delete()
    
    console.log('Deleting channels...')
    await db.table('channels').delete()
    
    console.log('✅ All channels deleted!')
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

main()
