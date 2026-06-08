<script setup lang="ts">
import { useCurrencyStore } from '@/stores/currency'

const currencyStore = useCurrencyStore()
</script>

<template>
  <router-view :key="currencyStore.currency" />
</template>
