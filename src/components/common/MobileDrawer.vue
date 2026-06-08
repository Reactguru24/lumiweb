<script setup lang="ts">
import { watch } from 'vue'
import { useScrollLock } from '@vueuse/core'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const isLocked = useScrollLock(document.body)

watch(() => props.open, (val) => {
  isLocked.value = val
}, { immediate: true })

function close() {
  emit('update:open', false)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-[70] md:hidden">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" @click="close" />
        <aside
          class="absolute inset-y-0 right-0 w-[min(100%,20rem)] sm:w-full max-w-sm bg-white dark:bg-gray-950 shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Panel'"
        >
          <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <h2 class="font-semibold text-lg">{{ title || 'Filters' }}</h2>
            <button type="button" class="control-button" aria-label="Close" @click="close">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <slot />
          </div>
          <div v-if="$slots.footer" class="shrink-0 border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-950 safe-bottom">
            <slot name="footer" />
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
