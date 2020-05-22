import { collectionData, docData } from 'rxfire/firestore'
import { map, mergeMap } from 'rxjs/operators'
import { of } from 'rxjs'
import { db } from '@/firebase'
import PresentationRepository from '@/repositories/PresentationRepository'

export default {
  get (id) {
    return docData(db.doc('screens/' + id), 'id')
  },
  getAll () {
    return collectionData(db.collection('screens'), 'id')
  },
  update (id, screen) {
    db.doc('screens/' + id).update(screen)
  },
  getWithPresentation (id) {
    return docData(db.doc('screens/' + id), 'id')
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
