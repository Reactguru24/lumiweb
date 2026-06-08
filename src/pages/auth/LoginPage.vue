<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { loginSchema } from '@/utils/validation'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

const form = ref({ email: '', password: '' })
const errors = ref<Record<string, string>>({})

async function submit() {
  errors.value = {}
  const result = loginSchema.safeParse(form.value)
  if (!result.success) {
    result.error.issues.forEach((i) => { errors.value[i.path[0] as string] = i.message })
    return
  }
  try {
    await auth.login(form.value.email, form.value.password)
    toast.success('Welcome back!')
    const redirect = route.query.redirect as string
    router.push(redirect || auth.getDashboardRoute())
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Login failed')
  }
}
</script>

<template>
  <div>
    <h1 class="font-display text-3xl font-semibold mb-2">Welcome Back</h1>
    <p class="text-gray-500 mb-8">Sign in to your account</p>

    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium mb-1.5">Email</label>
        <input v-model="form.email" type="email" class="input-field" placeholder="you@email.com" />
        <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1.5">Password</label>
        <input v-model="form.password" type="password" class="input-field" placeholder="••••••••" />
        <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="auth.loading">
        {{ auth.loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      Don't have an account?
      <router-link to="/auth/register" class="text-gray-900 dark:text-white font-medium hover:underline">Register</router-link>
    </p>

    <div class="mt-8 p-4 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 space-y-1">
      <p class="font-medium text-gray-700 dark:text-gray-300">Demo Accounts:</p>
      <p>Admin: admin@lumiafrica.com / admin123</p>
      <p>Customer: customer@lumiafrica.com / customer123</p>
      <p>Vendor: vendor@lumiafrica.com / vendor123</p>
    </div>
  </div>
</template>
