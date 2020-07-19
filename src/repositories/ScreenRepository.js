import { collectionData, docData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  get (id) {
    return docData(db.doc('screens/' + id), 'id')
  },
  getAll () {
    return collectionData(db.collection('screens'), 'id')
  },
  update (id, screen) {
    db.doc('screens/' + id).update(screen)
  }
}
