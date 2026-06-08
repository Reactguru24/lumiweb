<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { settingsApi } from '@/api/services'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const queryClient = useQueryClient()

const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })

const form = ref({
  taxRate: 0.08,
  categories: [] as string[],
  brands: [] as string[],
  newCategory: '',
  newBrand: '',
})

watch(settings, (s) => {
  if (s) form.value = { taxRate: s.taxRate, categories: [...s.categories], brands: [...s.brands], newCategory: '', newBrand: '' }
}, { immediate: true })

async function save() {
  await settingsApi.update({ taxRate: form.value.taxRate, categories: form.value.categories, brands: form.value.brands })
  toast.success('Settings saved')
  queryClient.invalidateQueries({ queryKey: ['settings'] })
}

function addCategory() {
  if (form.value.newCategory && !form.value.categories.includes(form.value.newCategory)) {
    form.value.categories.push(form.value.newCategory)
    form.value.newCategory = ''
  }
}

function addBrand() {
  if (form.value.newBrand && !form.value.brands.includes(form.value.newBrand)) {
    form.value.brands.push(form.value.newBrand)
    form.value.newBrand = ''
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Platform Settings</h1>
    <div class="grid md:grid-cols-2 gap-6 max-w-4xl">
      <div class="card p-6">
        <h2 class="font-semibold mb-4">Tax Settings</h2>
        <label class="text-sm font-medium">Tax Rate (%)</label>
        <input v-model.number="form.taxRate" type="number" step="0.01" class="input-field mt-1" />
        <p class="text-xs text-gray-500 mt-1">Current: {{ (form.taxRate * 100).toFixed(1) }}%</p>
      </div>

      <div class="card p-6">
        <h2 class="font-semibold mb-4">Shipping Methods</h2>
        <div v-if="settings" class="space-y-2 text-sm">
          <div v-for="method in settings.shippingMethods" :key="method.id" class="flex justify-between p-2 bg-gray-50 dark:bg-gray-800">
            <span>{{ method.name }}</span>
            <span class="text-gray-500">${{ method.price }} · {{ method.days }}</span>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="font-semibold mb-4">Categories</h2>
        <div class="flex flex-wrap gap-2 mb-3">
          <span v-for="cat in form.categories.slice(0, 10)" :key="cat" class="badge bg-gray-100 dark:bg-gray-800">{{ cat }}</span>
          <span v-if="form.categories.length > 10" class="text-xs text-gray-500">+{{ form.categories.length - 10 }} more</span>
        </div>
        <div class="flex gap-2">
          <input v-model="form.newCategory" placeholder="New category" class="input-field text-sm py-2 flex-1" />
          <button class="btn-secondary text-sm py-2" @click="addCategory">Add</button>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="font-semibold mb-4">Brands</h2>
        <div class="flex flex-wrap gap-2 mb-3">
          <span v-for="brand in form.brands" :key="brand" class="badge bg-gray-100 dark:bg-gray-800">{{ brand }}</span>
        </div>
        <div class="flex gap-2">
          <input v-model="form.newBrand" placeholder="New brand" class="input-field text-sm py-2 flex-1" />
          <button class="btn-secondary text-sm py-2" @click="addBrand">Add</button>
        </div>
      </div>

      <div class="card p-6 md:col-span-2">
        <h2 class="font-semibold mb-4">Active Coupons</h2>
        <div v-if="settings" class="grid md:grid-cols-3 gap-3">
          <div v-for="coupon in settings.coupons" :key="coupon.id" class="p-3 border border-gray-200 dark:border-gray-800 text-sm">
            <p class="font-mono font-bold">{{ coupon.code }}</p>
            <p class="text-gray-500">{{ coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}` }} off · Min ${{ coupon.minOrder }}</p>
          </div>
        </div>
      </div>
    </div>
    <button class="btn-primary mt-6" @click="save">Save Settings</button>
  </div>
</template>
