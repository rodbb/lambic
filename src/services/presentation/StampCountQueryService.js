import { map } from 'rxjs/operators'
import StampCountRepository from '@/repositories/StampCountRepository'

export default {
  get (presentationId) {
    return StampCountRepository.getChanges(presentationId)
      .pipe(map((stampCounts) => stampCounts.map(convertCountCalced)))
  }
}

function convertCountCalced (stampCount) {
  let totalCount = 0
  stampCount.shardChanges.forEach((shardChange) => {
    totalCount += shardChange.doc.data().count
  })
  return {
    id: stampCount.id,
    stampId: stampCount.stampId,
    count: totalCount
  }
}
