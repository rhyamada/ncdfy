// import something here
// import { firestorePlugin } from 'vuefire'
import firebase from 'firebase/app'
import 'firebase/auth' // eslint-disable-line
import 'firebase/firestore' // eslint-disable-line

export default ({ Vue }) => {
  // Vue.use(firestorePlugin)
  const firebaseConfig = {
    apiKey: 'AIzaSyDxFjLHht8hjVvqRL9Aw2UVVnwGTGkaDqk',
    authDomain: 'ncdfy1.firebaseapp.com',
    databaseURL: 'https://ncdfy1.firebaseio.com',
    projectId: 'ncdfy1',
    storageBucket: 'ncdfy1.appspot.com',
    messagingSenderId: '568353325311',
    appId: '1:568353325311:web:f129e6ddc604251de04cca'
  }
  firebase.initializeApp(firebaseConfig)
  firebase.auth().languageCode = 'pt'
  Vue.prototype.$auth = firebase.auth
  Vue.prototype.$db = firebase.firestore()
}
