import { config } from '@vue/test-utils'
import {
  QBanner,
  QBtn,
  QBtnToggle,
  QCard,
  QCardActions,
  QCardSection,
  QCheckbox,
  QDialog,
  QField,
  QForm,
  QIcon,
  QInput,
  QLayout,
  QPage,
  QPageContainer,
  QSkeleton,
  QToggle,
  Notify,
  Quasar,
} from 'quasar'
import { beforeEach } from 'vitest'

const components = {
  QBanner,
  QBtn,
  QBtnToggle,
  QCard,
  QCardActions,
  QCardSection,
  QCheckbox,
  QDialog,
  QField,
  QForm,
  QIcon,
  QInput,
  QLayout,
  QPage,
  QPageContainer,
  QSkeleton,
  QToggle,
}

config.global.plugins.unshift([
  Quasar,
  {
    components,
    plugins: { Notify },
  },
])

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}

window.scrollTo = () => {}
