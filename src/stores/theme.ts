import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { usePreferredDark } from '@vueuse/core'
import { getStorage, setStorage } from '@/utils/storage'

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'lumi_theme'

export const useThemeStore = defineStore('theme', () => {
  const preferredDark = usePreferredDark()
  const stored = getStorage<ThemeMode | null>(THEME_KEY, null)
  const isDark = ref(stored === 'dark' || (!stored && preferredDark.value))

  const mode = computed<ThemeMode>(() => (isDark.value ? 'dark' : 'light'))

  function applyTheme() {
    const root = document.documentElement
    root.classList.toggle('dark', isDark.value)
    root.dataset.theme = mode.value
    root.style.colorScheme = mode.value
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value: boolean) {
    isDark.value = value
  }

  function setMode(value: ThemeMode) {
    isDark.value = value === 'dark'
  }

  watch(isDark, (val) => {
    setStorage(THEME_KEY, val ? 'dark' : 'light')
    applyTheme()
  }, { immediate: true })

  return { isDark, mode, toggle, setDark, setMode, applyTheme }
})
