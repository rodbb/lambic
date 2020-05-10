import { collectionData, docData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  get: function (id) {
    return docData(db.doc('users/' + id), 'id')
  },
  getRef: function (id) {
    return db.doc('users/' + id)
  },
  getAll: function () {
    return collectionData(db.collection('users'), 'id')
  }
}
