import PresentationRepository from '@/repositories/PresentationRepository'
import ScreenRepository from '@/repositories/ScreenRepository'

export default {
  update (id, presentationId) {
    const displayPresentationRef = presentationId ? PresentationRepository.getRef(presentationId) : null
    ScreenRepository.update(id, { displayPresentationRef })
  }
}
