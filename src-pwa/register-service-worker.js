import { register } from 'register-service-worker'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    console.log('>>>ready')
  },

  registered (/* registration */) {
    console.log('>>>regist')
  },

  cached (/* registration */) {
    console.log('>>>cache')
  },

  updatefound (/* registration */) {
    console.log('>>>found')
  },

  updated (/* registration */) {
    console.log('>>>update')
  },

  offline () {
    console.log('>>>off')
  },

  error (/* err */) {
    console.log('>>>err')
  }
})
