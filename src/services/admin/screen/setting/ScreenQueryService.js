import { map, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import PresentationRepository from '@/repositories/PresentationRepository'
import ScreenRepository from '@/repositories/ScreenRepository'

export default {
  get (id) {
    return ScreenRepository.get(id)
      .pipe(
        mergeMap((screen) => {
          if (!screen.displayPresentationRef) {
            return of(screen)
          }
          return PresentationRepository.getWithUser(screen.displayPresentationRef.id)
            .pipe(map((presentaion) => {
              screen.displayPresentationRef = presentaion
              return screen
            }))
        })
      )
  }
}
