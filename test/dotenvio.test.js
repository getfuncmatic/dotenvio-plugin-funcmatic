require('dotenv').config()
var funcmatic = require('@funcmatic/funcmatic')
var DotenvioPlugin = require('../lib/dotenvio')

// Manually create a plugin to test a 'downstream' consumer
// of the env set up by EnvPlugin
class EnvConsumerPlugin {
  constructor() {
    this.name = 'envconsumer'
    this.config = null
    this.env = null
  }
  async start(config, env) {
    this.config = JSON.parse(JSON.stringify(config))
    this.env = JSON.parse(JSON.stringify(env))
  }
  async request() {
    return { service: { config: this.config, env: this.env } }
  }
}

beforeAll(async () => {
})

describe('Token Authentication', () => {
  beforeEach(() => {
    funcmatic = funcmatic.clone()
  })
  afterEach(async () => {
    await funcmatic.teardown()
  })
  it ('should retrieve and setup env variables for downstream plugins', async () => {
    funcmatic.use(DotenvioPlugin)
    funcmatic.use(EnvConsumerPlugin, env => ({
      redis: env.REDIS_BLAH
    }))
    var event = { }
    var context = { }
    await funcmatic.invoke(event, context, async (event, context, { envconsumer }) => {
      expect(envconsumer).toMatchObject({
        config: {
          redis: 'helloworld'
        },
        env: {  
          REDIS_BLAH: 'helloworld'
        }
      })
      expect(envconsumer.env.hasOwnProperty('DOTENVIO_ACCESS_KEY_ID')).toBeFalsy()
      expect(envconsumer.env.hasOwnProperty('DOTENVIO_SECRET_ACCESS_KEY')).toBeFalsy()
    })
  })
})