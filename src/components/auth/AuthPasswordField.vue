<template>
  <q-input
    :model-value="modelValue"
    :type="visible ? 'text' : 'password'"
    :label="label"
    :autocomplete="autocomplete"
    :rules="rules"
    outlined
    lazy-rules
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
})

defineEmits(['update:modelValue'])

const visible = ref(false)
</script>
