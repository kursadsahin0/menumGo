import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { QLayout, QPageContainer } from 'quasar'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

export async function mountPage(page, { path, name, start, routes = [], layout = false, meta } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path, name, component: page, meta }, ...routes],
  })

  await router.push(start || path)
  await router.isReady()

  const root = layout
    ? defineComponent({
        components: { QLayout, QPageContainer, Page: page },
        template:
          '<q-layout view="hHh lpR fFf"><q-page-container><Page /></q-page-container></q-layout>',
      })
    : page

  const wrapper = mount(root, {
    global: {
      plugins: [pinia, router],
    },
  })

  await flushPromises()
  return { wrapper, pinia, router }
}
