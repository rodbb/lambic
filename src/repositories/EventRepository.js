import moment from 'moment'
import { collectionData, docData } from 'rxfire/firestore'
import { map } from 'rxjs/operators'
import { db } from '@/firebase'

export default {
  get (id) {
    return docData(db.doc('events/' + id), 'id').pipe(map(convertEvent))
  },
  getAll () {
    return collectionData(db.collection('events').orderBy('date', 'desc'), 'id')
      .pipe(map((events) => events.map(convertEvent)))
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
