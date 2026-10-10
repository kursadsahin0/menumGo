import { useQuasar } from 'quasar'
import { friendlyMessage } from '@/utils/errors'

export function useNotify() {
  const $q = useQuasar()

  function notifySuccess(message) {
    $q.notify({ type: 'positive', message, position: 'top' })
  }

  function notifyError(error) {
    $q.notify({
      type: 'negative',
      message: typeof error === 'string' ? error : friendlyMessage(error),
      position: 'top',
    })
  }

  return { notifySuccess, notifyError }
}
