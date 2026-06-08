<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/services'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const toast = useToast()

const form = ref({
  fullName: auth.user?.fullName || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
})
const passwordForm = ref({ current: '', newPassword: '', confirm: '' })

async function saveProfile() {
  if (!auth.user) return
  await userApi.update(auth.user.id, form.value)
  auth.refreshUser()
  toast.success('Profile updated')
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirm) {
    toast.error('Passwords do not match')
    return
  }
  if (!auth.user) return
  await userApi.update(auth.user.id, { password: passwordForm.value.newPassword })
  passwordForm.value = { current: '', newPassword: '', confirm: '' }
  toast.success('Password updated')
}
</script>

<template>
  <div class="space-y-8">
    <div class="card p-6">
      <h2 class="font-semibold mb-4">Personal Information</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div><label class="text-sm font-medium">Full Name</label><input v-model="form.fullName" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Email</label><input v-model="form.email" type="email" class="input-field mt-1" disabled /></div>
        <div><label class="text-sm font-medium">Phone</label><input v-model="form.phone" class="input-field mt-1" /></div>
      </div>
      <button class="btn-primary mt-4" @click="saveProfile">Save Changes</button>
    </div>

    <div class="card p-6">
      <h2 class="font-semibold mb-4">Password Settings</h2>
      <div class="space-y-4 max-w-md">
        <div><label class="text-sm font-medium">New Password</label><input v-model="passwordForm.newPassword" type="password" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Confirm Password</label><input v-model="passwordForm.confirm" type="password" class="input-field mt-1" /></div>
      </div>
      <button class="btn-primary mt-4" @click="changePassword">Update Password</button>
    </div>
  </div>
</template>
