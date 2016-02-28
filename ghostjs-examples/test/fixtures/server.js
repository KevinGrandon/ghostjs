import Hapi from 'hapi'

let instance;

var Server = function(config  = {}) {
  instance = new Hapi.Server()

  config.port = config.port || 8888

  instance.connection(config);

  instance.register(require('inert'), (err) => {
    if (err) {
      throw err
    }

    instance.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: __dirname
        }
      }
    })
  })

  instance.start((err) => {
    if (err) {
      console.error(err)
    }
    //console.log('Server started.')
  })
}

Server.stop = function() {
  instance.stop()
}

export default Server
