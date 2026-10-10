<template>
  <p v-for="paragraph in paragraphs" :key="paragraph">
    <template v-for="(part, partIndex) in paragraphParts(paragraph)" :key="partIndex">
      <router-link v-if="part.to" :to="part.to">{{ part.text }}</router-link>
      <a v-else-if="part.href" :href="part.href">{{ part.text }}</a>
      <template v-else>{{ part.text }}</template>
    </template>
  </p>
</template>

<script setup>
import { SALES_PHONE, SALES_PHONE_HREF } from '@/utils/constants'

defineProps({
  paragraphs: {
    type: Array,
    required: true,
  },
})

const inlineLinks = [
  { text: SALES_PHONE, href: SALES_PHONE_HREF },
  { text: 'gizlilik bildirimini', to: { name: 'privacy' } },
  { text: 'KVKK aydınlatma metnini', to: { name: 'kvkk' } },
]

function paragraphParts(paragraph) {
  const parts = []
  let rest = paragraph
  while (rest) {
    const next = inlineLinks.reduce((found, link) => {
      const index = rest.indexOf(link.text)
      if (index === -1) return found
      if (!found || index < found.index) return { index, link }
      return found
    }, null)
    if (!next) {
      parts.push({ text: rest })
      break
    }
    if (next.index > 0) parts.push({ text: rest.slice(0, next.index) })
    parts.push({ text: next.link.text, href: next.link.href, to: next.link.to })
    rest = rest.slice(next.index + next.link.text.length)
  }
  return parts
}
</script>
