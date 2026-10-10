<template>
  <q-input
    :model-value="modelValue"
    :type="visible ? 'text' : 'password'"
    :label="label"
    :autocomplete="autocomplete"
    :rules="rules"
    outlined
    lazy-rules
    :dense="dense"
    :hide-bottom-space="hideBottomSpace"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #append>
      <q-icon
        :name="visible ? 'visibility_off' : 'visibility'"
        class="cursor-pointer"
        @click="visible = !visible"
      />
    </template>
  </q-input>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: true,
  },
  autocomplete: {
    type: String,
    default: 'current-password',
  },
  rules: {
    type: Array,
    default: () => [],
  },
  dense: {
    type: Boolean,
    default: false,
  },
  hideBottomSpace: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:modelValue'])

const visible = ref(false)
</script>
