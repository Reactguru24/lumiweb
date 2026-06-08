<script setup lang="ts">
import { useCurrencyStore, type CurrencyCode } from '@/stores/currency'

const currencyStore = useCurrencyStore()
</script>

<template>
  <select
    :value="currencyStore.currency"
    class="control-select"
    aria-label="Select currency"
    @change="currencyStore.setCurrency(($event.target as HTMLSelectElement).value as CurrencyCode)"
  >
    <option v-for="c in currencyStore.CURRENCIES" :key="c.code" :value="c.code">
      {{ c.code }}
    </option>
  </select>
</template>
