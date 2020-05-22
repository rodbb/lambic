import firebase from 'firebase/app'
import { collectionData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  getAll (presentationId) {
    return collectionData(db.collection('comments').where('presentationId', '==', presentationId), 'id')
  },
  create (comment) {
    comment.postedAt = firebase.firestore.Timestamp.fromDate(new Date())
    db.collection('comments').add(comment)
  },
  update (id, comment) {
    db.doc('comments/' + id).update(comment)
  },
  delete (id) {
    db.doc('comments/' + id).delete()
  },
  deleteAll (batch, presentationId) {
    this.getAll(presentationId).subscribe((commentSnapshotList) => {
      commentSnapshotList.forEach((commentSnapshot) => {
        batch.delete(commentSnapshot.ref)
      })
    }).unsubscribe()
    return batch
  }
}
