import moment from 'moment'
import { collectionData, docData } from 'rxfire/firestore'
import { map } from 'rxjs/operators'
import { db } from '@/firebase'

export default {
  get: function (id) {
    return docData(db.doc('events/' + id), 'id').pipe(map(convertEvent))
  },
  getAll: function () {
    // 全イベントのリスナを作成
    return collectionData(db.collection('events'), 'id').pipe(map((events) => events.map((ev) => convertEvent(ev))))
  }
}

function convertEvent (ev) {
  const nowDate = new Date()
  const evDate = ev.date.toDate()
  return {
    ...ev,
    id: ev.id,
    date: evDate,
    isFinished: moment(evDate).isBefore(nowDate, 'day'),
    isToday: moment(evDate).isSame(nowDate, 'day')
  }
}
