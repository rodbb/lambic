import firebase from 'firebase/app'
import { collectionData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  getAll: function (presentationId) {
    return collectionData(db.collection('comments').where('presentationId', '==', presentationId), 'id')
  },
  create: function (comment) {
    comment.postedAt = firebase.firestore.Timestamp.fromDate(new Date())
    db.collection('comments').add(comment)
  },
  update: function (id, comment) {
    db.doc('comments/' + id).update(comment)
  },
  delete: function (id) {
    db.doc('comments/' + id).delete()
  },
  deleteAll: function (batch, presentationId) {
    this.getAll(presentationId).subscribe((commentSnapshotList) => {
      commentSnapshotList.forEach((commentSnapshot) => {
        batch.delete(commentSnapshot.ref)
      })
    }).unsubscribe()
    return batch
  }
}
