<script setup lang="ts">
import { InboxIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title: string
  description?: string
  actionLabel?: string
}>()

defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <InboxIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ title }}</h3>
    <p v-if="description" class="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{{ description }}</p>
    <button v-if="actionLabel" class="btn-primary" @click="$emit('action')">{{ actionLabel }}</button>
  </div>
</template>
