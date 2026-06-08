<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { registerSchema } from '@/utils/validation'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const form = ref({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
const errors = ref<Record<string, string>>({})

async function submit() {
  errors.value = {}
  const result = registerSchema.safeParse(form.value)
  if (!result.success) {
    result.error.issues.forEach((i) => { errors.value[i.path[0] as string] = i.message })
    return
  }
  try {
    await auth.register({
      fullName: form.value.fullName,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
    })
    toast.success('Account created successfully!')
    router.push('/account')
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Registration failed')
  }
}
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-semibold mb-2">Create Account</h1>
    <p class="text-gray-500 mb-8">Join LumiAfrica and start shopping across East Africa</p>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium mb-1.5">Full Name</label>
        <input v-model="form.fullName" class="input-field" placeholder="John Doe" />
        <p v-if="errors.fullName" class="text-red-500 text-xs mt-1">{{ errors.fullName }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Email</label>
        <input v-model="form.email" type="email" class="input-field" placeholder="you@email.com" />
        <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Phone Number</label>
        <input v-model="form.phone" type="tel" class="input-field" placeholder="+1 234 567 8900" />
        <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Password</label>
        <input v-model="form.password" type="password" class="input-field" placeholder="••••••••" />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Confirm Password</label>
        <input v-model="form.confirmPassword" type="password" class="input-field" placeholder="••••••••" />
        <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="auth.loading">
        {{ auth.loading ? 'Creating...' : 'Create Account' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      Already have an account?
      <router-link to="/auth/login" class="text-gray-900 dark:text-white font-medium hover:underline">Sign In</router-link>
    </p>
  </div>
</template>
