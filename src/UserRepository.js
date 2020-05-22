import { collectionData, docData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  get (id) {
    return docData(db.doc('users/' + id), 'id')
  },
  getRef (id) {
    return db.doc('users/' + id)
  },
  getAll () {
    return collectionData(db.collection('users'), 'id')
  },
  getListByIds (ids) {
    return collectionData(db.collection('users').where('id', 'in', ids), 'id')
  }
}
