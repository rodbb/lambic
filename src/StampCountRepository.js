import firebase from 'firebase/app'
import { sortedChanges, collectionData } from 'rxfire/firestore'
import { db } from '@/firebase'

export default {
  getChange: function (id) {
    return sortedChanges(db.doc('stampCounts/' + id).collection('shards'), ['added', 'modified'])
  },
  getAll: function (presentationId) {
    return collectionData(db.collection('stampCounts').where('presentationId', '==', presentationId), 'id')
  },
  create: function (batch, stampCount) {
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
  updateCount: function (id) {
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
  deleteAll: function (batch, presentationId) {
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
