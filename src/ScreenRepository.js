import { collectionData, docData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  get: function (id) {
    return docData(db.doc('screens/' + id), 'id')
  },
  getAll: function () {
    return collectionData(db.collection('screens'), 'id')
  },
  update: function (id, screen) {
    db.doc('screens/' + id).update(screen)
  }
}
