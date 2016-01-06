import Hapi from 'hapi'

let server = new Hapi.Server()

server.connection({
  port: 8888
})

server.register(require('inert'), (err) => {
  if (err) {
    throw err
  }

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: __dirname
      }
    }
  })
})

export default function() {
  server.start((err) => {
    if (err) {
      console.error(err)
    }
    //console.log('Server started.')
  })
}
