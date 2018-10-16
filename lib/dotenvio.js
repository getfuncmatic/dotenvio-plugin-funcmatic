class DotenvioPlugin {
  constructor() {
    this.name = 'dotenvio'
    this.dotenvio = null
    this.env = null
  }
  
  async start(conf, env) {
    if (!env.DOTENVIO_ACCESS_KEY_ID || !env.DOTENVIO_SECRET_ACCESS_KEY) {
      // noop if necessary env variables are not provided
      // this means that user can use local dotenv
      return 
    }
    this.dotenvio = require('@funcmatic/dotenvio').create({
      accessKeyId: env.DOTENVIO_ACCESS_KEY_ID,
      secretAccessKey: env.DOTENVIO_SECRET_ACCESS_KEY
    })
    this.env = await this.dotenvio.config()
    for (var key in this.env) {
      // this sets the variables we retrieved
      // in funcmatic's env so that the start hooks 
      // of plugins down line can access them
      env[key] = this.env[key]
    }
    // let's delete the DOTENVIO specific variables since
    // not future plugins or user code should depend on them
    delete env['DOTENVIO_ACCESS_KEY_ID']
    delete env['DOTENVIO_SECRET_ACCESS_KEY']
  }
}

module.exports = DotenvioPlugin
