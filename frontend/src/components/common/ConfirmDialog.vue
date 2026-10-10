<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="confirm-dialog" role="alertdialog" :aria-labelledby="titleId">
      <q-card-section>
        <div :id="titleId" class="confirm-dialog__title">{{ title }}</div>
        <p v-if="message">{{ message }}</p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          v-if="!hideCancel"
          flat
          no-caps
          label="Vazgeç"
          :disable="loading"
          @click="emit('update:modelValue', false)"
        />
        <q-btn
          unelevated
          no-caps
          :color="danger ? 'negative' : 'primary'"
          :label="confirmLabel"
          :loading="loading"
          @click="emit('confirm')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useId } from 'vue'

const titleId = useId()

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  confirmLabel: {
    type: String,
    default: 'Onayla',
  },
  danger: {
    type: Boolean,
    default: false,
  },
  hideCancel: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])
</script>
