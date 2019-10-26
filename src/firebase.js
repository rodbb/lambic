import firebase from 'firebase/app'
import FirebaseConfig from '../firebase-config.json'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/auth'

const app = !firebase.apps.length ? firebase.initializeApp(FirebaseConfig) : firebase.app()

const db = app.firestore()
db.settings({})
const storage = app.storage()
const auth = app.auth()

export { db, storage, auth }
