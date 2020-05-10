import { collectionData, docData } from 'rxfire/firestore'
import { db } from '@/firebase'
import CommentRepository from '@/CommentRepository'
import StampCountRepository from '@/StampCountRepository'
import StampRepository from '@/StampRepository'

export default {
  get: function (id) {
    return docData(db.doc('presentations/' + id), 'id')
  },
  getRef: function (id) {
    return db.doc('presentations/' + id)
  },
  getAll: function (eventId) {
    return collectionData(db.collection('presentations').where('eventId', '==', eventId), 'id')
  },
  create: function (presentation) {
    new Promise((resolve) => {
      const batch = db.batch()
      // 発表を追加する ///////////////////////////////////////////////////
      const newPresentationDoc = db.collection('presentations').doc()
      batch.set(newPresentationDoc, presentation)

      // スタンプカウントを追加する ////////////////////////////////////////
      // 有効なスタンプの数だけ追加
      StampRepository.getAllAvailable().subscribe((canUseStamps) => {
        canUseStamps.forEach((stampDoc) => {
          StampCountRepository.create({
            presentationId: newPresentationDoc.id,
            stampId: stampDoc.id,
            shardNum: process.env.VUE_APP_STAMP_COUNT_SHARD_NUM
          })
        }) // End forEach
        resolve(batch)
      }).unsubscribe()
    })
      .then((batch) => {
        batch.commit()
      })
  },
  update: function (id, presentation) {
    db.doc('presentations/' + id).update(presentation)
  },
  delete: function (id) {
    new Promise((resolve) => {
      const batch = db.batch()
      // スタンプカウント削除
      StampCountRepository.deleteAll(batch, id)
      // コメント削除
      CommentRepository.deleteAll()
      // 発表削除
      batch.delete(db.doc('presentations/' + this.id))
      resolve(batch)
    })
      .then((batch) => {
        batch.commit()
      })
  }
}
