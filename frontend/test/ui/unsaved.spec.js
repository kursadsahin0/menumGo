import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'
import UnsavedChanges from '@/components/common/UnsavedChanges.vue'

const Root = defineComponent({
  template: '<router-view />',
})

function formPage(dirty) {
  return defineComponent({
    components: { UnsavedChanges },
    template: `<div>
      <button class="go" @click="$router.push('/next')">Git</button>
      <UnsavedChanges :dirty="${dirty}" />
    </div>`,
  })
}

async function openForm(dirty) {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/form', component: formPage(dirty) },
      { path: '/next', component: { template: '<div>Sonraki</div>' } },
    ],
  })

  await router.push('/form')
  await router.isReady()

  const wrapper = mount(Root, {
    attachTo: document.body,
    global: { plugins: [pinia, router] },
  })

  await flushPromises()
  return { wrapper, router }
}

describe('kaydedilmemiş form', () => {
  let wrapper

  afterEach(() => {
    wrapper?.unmount()
  })

  it('değişiklik varken çıkmayı sorar ve vazgeçince sayfada kalır', async () => {
    const opened = await openForm(true)
    wrapper = opened.wrapper

    await wrapper.get('.go').trigger('click')
    await flushPromises()

    expect(document.body.textContent).toContain('Kaydedilmemiş değişiklik')
    expect(opened.router.currentRoute.value.path).toBe('/form')

    const stay = [...document.body.querySelectorAll('button')].find((node) =>
      node.textContent.includes('Vazgeç'),
    )
    stay.click()
    await flushPromises()

    expect(opened.router.currentRoute.value.path).toBe('/form')
    expect(document.body.textContent).not.toContain('Sonraki')
  })

  it('çık denince sonraki sayfaya gider', async () => {
    const opened = await openForm(true)
    wrapper = opened.wrapper

    await wrapper.get('.go').trigger('click')
    await flushPromises()

    const leave = [...document.body.querySelectorAll('button')].find(
      (node) => node.textContent.trim() === 'Çık',
    )
    leave.click()
    await flushPromises()

    expect(opened.router.currentRoute.value.path).toBe('/next')
  })

  it('değişiklik yokken sormadan gider', async () => {
    const opened = await openForm(false)
    wrapper = opened.wrapper

    await wrapper.get('.go').trigger('click')
    await flushPromises()

    expect(document.body.textContent).not.toContain('Kaydedilmemiş değişiklik')
    expect(opened.router.currentRoute.value.path).toBe('/next')
  })
})
