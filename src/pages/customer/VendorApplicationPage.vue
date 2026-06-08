<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { vendorApplicationApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { vendorApplicationSchema } from '@/utils/validation'
import StatusBadge from '@/components/common/StatusBadge.vue'
import type { VendorApplication } from '@/types'

const auth = useAuthStore()
const toast = useToast()
const existing = ref<VendorApplication | null>(null)
const errors = ref<Record<string, string>>({})

const categories = ["Men's Wear", "Women's Wear", 'Streetwear', 'Sportswear', 'Luxury Fashion', 'Accessories']

const form = ref({
  storeName: '',
  businessDescription: '',
  logo: 'https://images.unsplash.com/photo-1441984904996-e0b495a9b1da?w=100&h=100&fit=crop&q=80',
  contactPhone: auth.user?.phone || '',
  businessEmail: auth.user?.email || '',
  country: '',
  city: '',
  socialLinks: { instagram: '', twitter: '' },
  registrationNumber: '',
  categories: [] as string[],
})

onMounted(async () => {
  if (auth.user) existing.value = await vendorApplicationApi.getByUserId(auth.user.id)
})

function toggleCategory(cat: string) {
  const idx = form.value.categories.indexOf(cat)
  if (idx >= 0) form.value.categories.splice(idx, 1)
  else form.value.categories.push(cat)
}

function mockLogoUpload() {
  form.value.logo = `https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&q=80`
  toast.info('Logo uploaded (mock)')
}

async function submit() {
  errors.value = {}
  const result = vendorApplicationSchema.safeParse(form.value)
  if (!result.success) {
    result.error.issues.forEach((i) => { errors.value[i.path[0] as string] = i.message })
    return
  }
  try {
    await vendorApplicationApi.submit(auth.user!.id, form.value)
    existing.value = await vendorApplicationApi.getByUserId(auth.user!.id)
    toast.success('Application submitted!')
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Submission failed')
  }
}
</script>

<template>
  <div>
    <div v-if="existing" class="card p-6 mb-8">
      <h2 class="font-semibold mb-4">Application Status</h2>
      <div class="flex items-center gap-3 mb-2">
        <StatusBadge :status="existing.status" />
        <span class="text-sm text-gray-500">Submitted {{ new Date(existing.submittedAt).toLocaleDateString() }}</span>
      </div>
      <p v-if="existing.reviewNote" class="text-sm text-gray-500 mt-2">{{ existing.reviewNote }}</p>
      <p v-if="existing.status === 'approved'" class="text-sm text-green-600 mt-2">Congratulations! You are now a vendor. Please sign out and sign back in.</p>
    </div>

    <form v-if="!existing || existing.status === 'rejected'" class="space-y-6" @submit.prevent="submit">
      <h2 class="font-semibold">Vendor Application</h2>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium">Store Name</label>
          <input v-model="form.storeName" class="input-field mt-1" />
          <p v-if="errors.storeName" class="text-red-500 text-xs mt-1">{{ errors.storeName }}</p>
        </div>
        <div>
          <label class="text-sm font-medium">Business Email</label>
          <input v-model="form.businessEmail" type="email" class="input-field mt-1" />
        </div>
        <div class="md:col-span-2">
          <label class="text-sm font-medium">Business Description</label>
          <textarea v-model="form.businessDescription" rows="3" class="input-field mt-1" />
          <p v-if="errors.businessDescription" class="text-red-500 text-xs mt-1">{{ errors.businessDescription }}</p>
        </div>
        <div>
          <label class="text-sm font-medium">Contact Phone</label>
          <input v-model="form.contactPhone" class="input-field mt-1" />
        </div>
        <div>
          <label class="text-sm font-medium">Registration Number</label>
          <input v-model="form.registrationNumber" class="input-field mt-1" />
        </div>
        <div>
          <label class="text-sm font-medium">Country</label>
          <input v-model="form.country" class="input-field mt-1" />
        </div>
        <div>
          <label class="text-sm font-medium">City</label>
          <input v-model="form.city" class="input-field mt-1" />
        </div>
      </div>

      <div>
        <label class="text-sm font-medium mb-2 block">Logo Upload (Mock)</label>
        <div class="flex items-center gap-4">
          <img :src="form.logo" alt="Logo" class="w-16 h-16 rounded-full object-cover" />
          <button type="button" class="btn-secondary text-sm py-2" @click="mockLogoUpload">Upload Logo</button>
        </div>
      </div>

      <div>
        <label class="text-sm font-medium mb-2 block">Clothing Categories</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories" :key="cat" type="button"
            class="px-3 py-1.5 text-sm border transition-colors"
            :class="form.categories.includes(cat) ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border-gray-300 dark:border-gray-700'"
            @click="toggleCategory(cat)"
          >{{ cat }}</button>
        </div>
        <p v-if="errors.categories" class="text-red-500 text-xs mt-1">{{ errors.categories }}</p>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div><label class="text-sm font-medium">Instagram</label><input v-model="form.socialLinks.instagram" class="input-field mt-1" placeholder="@handle" /></div>
        <div><label class="text-sm font-medium">Twitter</label><input v-model="form.socialLinks.twitter" class="input-field mt-1" placeholder="@handle" /></div>
      </div>

      <button type="submit" class="btn-primary">Submit Application</button>
    </form>
  </div>
</template>
