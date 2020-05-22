import { collectionData, docData } from 'rxfire/firestore'
import { combineLatest, map, mergeMap } from 'rxjs/operators'
import { db } from '@/firebase'
import CommentRepository from '@/CommentRepository'
import StampCountRepository from '@/StampCountRepository'
import StampRepository from '@/StampRepository'
import UserRepository from '@/UserRepository'

export default {
  get (id) {
    return docData(db.doc('presentations/' + id), 'id')
  },
  getRef (id) {
    return db.doc('presentations/' + id)
  },
  getAll () {
    return collectionData(db.collection('presentations'), 'id')
  },
  getListById (eventId) {
    return collectionData(db.collection('presentations').where('eventId', '==', eventId), 'id')
  },
  create (presentation) {
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
  update (id, presentation) {
    db.doc('presentations/' + id).update(presentation)
  },
  delete (id) {
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
  },
  getWithUser (id) {
    return this.get(id).pipe(mergeMap((presentation) => {
      return UserRepository.get(presentation.presenter.id)
        .pipe(map((user) => {
          presentation.presenter = user
          return presentation
        }))
    }))
  },
  getListByEventIdWithUser (eventId) {
    return this.getListById(eventId).pipe(mergeMap((presentations) => {
      const userIds = presentations.map(presentation => presentation.presenter.id)
      return UserRepository.getListByIds(userIds)
        .pipe(map((users) => {
          presentations.forEach((presentation) => {
            presentation.presenter = users.find(user => user.id === presentation.presenter.id)
          })
          return presentations
        }))
    }))
  },
  getWithAllData (id) {
    return this.get(id)
      .pipe(combineLatest(UserRepository.getAll(), CommentRepository.getAll(id), StampRepository.getAll()))
  }
}
