<template>
  <ConfirmDialog
    :model-value="open"
    title="Kaydedilmemiş değişiklik"
    message="Bu sayfadan çıkarsanız yazdıklarınız kaybolur."
    confirm-label="Çık"
    danger
    @update:model-value="onDialog"
    @confirm="finish(true)"
  />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const props = defineProps({
  dirty: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['discard'])
const open = ref(false)
let resolveLeave = null

function finish(allowed) {
  const resolve = resolveLeave
  resolveLeave = null
  open.value = false

  if (allowed) {
    emit('discard')
  }

  resolve?.(allowed)
}

function onDialog(value) {
  if (!value) {
    finish(false)
  }
}

onBeforeRouteLeave(() => {
  if (!props.dirty) {
    return true
  }

  open.value = true
  return new Promise((resolve) => {
    resolveLeave = resolve
  })
})

function onBeforeUnload(event) {
  if (!props.dirty) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>
