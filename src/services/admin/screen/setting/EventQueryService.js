import { map, mergeMap } from 'rxjs/operators'
import EventRepository from '@/repositories/EventRepository'
import PresentationRepository from '@/repositories/PresentationRepository'

export default {
  get (id) {
    return EventRepository.get(id).pipe(mergeMap((event) => {
      return PresentationRepository.getListByEventIdWithUser(id)
        .pipe(map((presentations) => {
          event.presentations = presentations
          return event
        }))
    }))
  }
}
