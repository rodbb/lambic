import { collectionData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  getAll: function () {
    return collectionData(db.collection('stamps'), 'id')
  },
  getAllAssigned: function (ids) {
    return collectionData(db.collection('stamps').where('id', 'in', ids), 'id')
  },
  getAllAvailable: function () {
    return collectionData(db.collection('stamps').where('canUse', '==', true), 'id')
  }
}
