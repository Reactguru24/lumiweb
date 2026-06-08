<script setup lang="ts">
import CurrencySelector from '@/components/common/CurrencySelector.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

withDefaults(defineProps<{
  showCurrency?: boolean
  showTheme?: boolean
}>(), {
  showCurrency: true,
  showTheme: true,
})
</script>

<template>
  <div class="appearance-controls" role="group" aria-label="Appearance settings">
    <CurrencySelector v-if="showCurrency" />
    <ThemeToggle v-if="showTheme" />
  </div>
</template>
