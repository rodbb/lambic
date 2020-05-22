import { collectionData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  getAll () {
    return collectionData(db.collection('stamps').orderBy('order'), 'id')
  },
  getAllAvailable () {
    return collectionData(db.collection('stamps').where('canUse', '==', true).orderBy('order'), 'id')
  }
}
