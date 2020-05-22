import firebase from 'firebase/app'
import { sortedChanges, collectionData } from 'rxfire/firestore'
import { map, mergeMap } from 'rxjs/operators'
import { combineLatest } from 'rxjs'
import { db } from '@/firebase'

export default {
  getChanges (presentationId) {
    return this.getAll(presentationId).pipe(mergeMap((stampCounts) => {
      const changes = stampCounts.map(stampCount => {
        return this.getChange(stampCount.id).pipe(map((shardChanges) => {
          return {
            shardChanges: shardChanges,
            ...stampCount
          }
        }))
      })
      return combineLatest(changes)
    }))
  },
  getChange (id) {
    return sortedChanges(db.doc('stampCounts/' + id).collection('shards'), ['added', 'modified'])
  },
  getAll (presentationId) {
    return collectionData(db.collection('stampCounts').where('presentationId', '==', presentationId), 'id')
  },
  create (batch, stampCount) {
    const stampCountDoc = db.collection('stampCounts').doc()
    batch.set(stampCountDoc, stampCount)

    // スタンプカウントにshardsサブコレクションを追加する ////////////////
    const stampCountShards = stampCountDoc.collection('shards')
    for (let idx = 0; idx < process.env.VUE_APP_STAMP_COUNT_SHARD_NUM; idx++) {
      batch.set(stampCountShards.doc(idx.toString()), {
        count: 0
      })
    }
    return batch
  },
  updateCount (id) {
    const stampCountDoc = db.doc('stampCounts/' + id)
    stampCountDoc
      .get()
      .then((scSnap) => {
        // 1回/秒の更新制限を回避するため
        // shardNum個あるshardsのうち、ランダムな1個のカウントをインクリメント
        const shardIdx = Math.floor(Math.random() * scSnap.data().shardNum).toString()
        stampCountDoc.collection('shards').doc(shardIdx).update({
          count: firebase.firestore.FieldValue.increment(1)
        })
      })
  },
  deleteAll (batch, presentationId) {
    // スタンプカウント削除
    this.getAll(presentationId).subscribe((stampCountSnapshotList) => {
      stampCountSnapshotList.forEach((stampCountSnapshot) => {
      // shardsサブコレクション内ドキュメント削除
        stampCountSnapshot.ref.get().then((stampCount) => {
          const shardNum = stampCount.data().shardNum
          for (let idx = 0; idx < shardNum; idx++) {
            batch.delete(stampCountSnapshot.ref.collection('shards').doc(idx.toString()))
          }
        })
        // スタンプカウントドキュメント削除
        batch.delete(stampCountSnapshot.ref)
      })
    }).unsubscribe()
    return batch
  }
}
