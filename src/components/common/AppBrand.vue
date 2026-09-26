<template>
  <div class="row items-center no-wrap">
    <q-avatar color="primary" text-color="white" icon="restaurant" size="32px" />
    <div class="q-ml-sm text-weight-medium">{{ APP_NAME }}</div>
  </div>
</template>

<script setup>
import { APP_NAME } from '@/utils/constants'
</script>
