import Hapi from 'hapi'
import fs from 'fs'

let server = new Hapi.Server()
let tls = {
  key:  fs.readFileSync(__dirname + '/ssl.key'),
  cert: fs.readFileSync(__dirname + '/ssl.crt')
};
server.connection({ port: 9443, tls: tls });

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
  })
}
