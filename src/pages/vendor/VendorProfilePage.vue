<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { vendorApi } from '@/api/services'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const toast = useToast()
const queryClient = useQueryClient()

const { data: vendor } = useQuery({
  queryKey: ['my-vendor', auth.user?.id],
  queryFn: () => vendorApi.getByUserId(auth.user!.id),
})

const form = ref({
  storeName: '', description: '', contactPhone: '', businessEmail: '',
  country: '', city: '', socialLinks: { instagram: '', twitter: '' },
  logo: '', banner: '',
})

watch(vendor, (v) => {
  if (v) {
    form.value = {
      storeName: v.storeName, description: v.description, contactPhone: v.contactPhone,
      businessEmail: v.businessEmail, country: v.country, city: v.city,
      socialLinks: {
        instagram: v.socialLinks.instagram || '',
        twitter: v.socialLinks.twitter || '',
      },
      logo: v.logo, banner: v.banner,
    }
  }
}, { immediate: true })

async function save() {
  if (!vendor.value) return
  await vendorApi.update(vendor.value.id, form.value)
  queryClient.invalidateQueries({ queryKey: ['my-vendor'] })
  toast.success('Store profile updated')
}

function mockUpload(field: 'logo' | 'banner') {
  form.value[field] = field === 'logo'
    ? 'https://images.unsplash.com/photo-1441984904996-e0b495a9b1da?w=100&h=100&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop&q=80'
  toast.info(`${field} uploaded (mock)`)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Store Settings</h1>
    <form v-if="vendor" class="card p-6 space-y-6 max-w-2xl" @submit.prevent="save">
      <div class="flex items-center gap-4">
        <img :src="form.logo" class="w-20 h-20 rounded-full object-cover" alt="Logo" />
        <button type="button" class="btn-secondary text-sm py-2" @click="mockUpload('logo')">Change Logo</button>
      </div>
      <div>
        <img :src="form.banner" class="w-full h-32 object-cover" alt="Banner" />
        <button type="button" class="btn-secondary text-sm py-2 mt-2" @click="mockUpload('banner')">Change Banner</button>
      </div>
      <div><label class="text-sm font-medium">Store Name</label><input v-model="form.storeName" class="input-field mt-1" /></div>
      <div><label class="text-sm font-medium">Description</label><textarea v-model="form.description" rows="4" class="input-field mt-1" /></div>
      <div class="grid md:grid-cols-2 gap-4">
        <div><label class="text-sm font-medium">Phone</label><input v-model="form.contactPhone" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Email</label><input v-model="form.businessEmail" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Country</label><input v-model="form.country" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">City</label><input v-model="form.city" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Instagram</label><input v-model="form.socialLinks.instagram" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Twitter</label><input v-model="form.socialLinks.twitter" class="input-field mt-1" /></div>
      </div>
      <button type="submit" class="btn-primary">Save Settings</button>
    </form>
  </div>
</template>
