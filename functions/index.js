const functions = require('firebase-functions')

const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()
db.settings({
  timestampsInSnapshots: true
})

// シャードの数は最適な数がわからないので暫定の値
//  少なすぎると再試行回数が増えて書き込みに時間がかかる
//  多すぎると合計値の算出にコスト（時間・読み取り回数）がかかる
const shardNum = 3

exports.createStampCountsWithPresentations = functions.firestore
  .document("/presentations/{documentId}")
  .onCreate((snap) => {
    console.log('triggered by add presentation doc. the doc ID: ' + snap.id)
    return db.collection('stamps')
      .get()
      .then((stamps) => {
        return Promise.all(stamps.docs.map((stamp) => 
          db.collection('stampCounts').add({
            presentationId: snap.id,
            stampId: stamp.id,
            shardNum: shardNum
          })
        ))
      })
      .then(createAndInitializeShards)
  })

exports.createStampCountsWithStamps = functions.firestore
  .document("/stamps/{documentId}")
  .onCreate((snap) => {
    console.log('triggered by add stamp doc. the doc ID: ' + snap.id)
    return db.collection('presentations')
      .get()
      .then((presentations) => {
        return Promise.all(presentations.docs.map((presentation) => 
          db.collection('stampCounts').add({
            presentationId: presentation.id,
            stampId: snap.id,
            shardNum: shardNum
          })
        ))
      })
      .then(createAndInitializeShards)
  })

function createAndInitializeShards (addedRefs) {
  const batch = db.batch()
  addedRefs.forEach((addedRef) => {
    console.log('stampCounts ID:' + addedRef.id + '  created!!')
    // Initialize the counter document
    batch.set(addedRef, { shardNum: shardNum }, { merge: true })
    // Initialize each shard with count=0
    for (let i = 0; i < shardNum; i++) {
      let shardRef = addedRef.collection('shards').doc(i.toString())
      batch.set(shardRef, { count: 0 })
    }
  })
  // // Commit the write batch
  return batch.commit()
}