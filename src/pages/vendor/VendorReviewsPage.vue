<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { vendorApi, reviewApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { StarIcon } from '@heroicons/vue/24/solid'

const auth = useAuthStore()
const toast = useToast()
const queryClient = useQueryClient()
const replyText = ref<Record<string, string>>({})

const { data: vendor } = useQuery({
  queryKey: ['my-vendor', auth.user?.id],
  queryFn: () => vendorApi.getByUserId(auth.user!.id),
})

const { data: reviews, isLoading } = useQuery({
  queryKey: computed(() => ['vendor-reviews', vendor.value?.id]),
  queryFn: () => reviewApi.getByVendor(vendor.value!.id),
  enabled: computed(() => !!vendor.value?.id),
})

async function submitReply(reviewId: string) {
  const reply = replyText.value[reviewId]
  if (!reply?.trim()) return
  await reviewApi.reply(reviewId, reply)
  toast.success('Reply posted')
  replyText.value[reviewId] = ''
  queryClient.invalidateQueries({ queryKey: ['vendor-reviews'] })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold mb-6">Customer Reviews</h1>
    <div v-if="isLoading" class="space-y-3"><div v-for="i in 5" :key="i" class="skeleton h-24" /></div>
    <div v-else-if="reviews?.length" class="space-y-4">
      <div v-for="review in reviews" :key="review.id" class="card p-4">
        <div class="flex items-center justify-between mb-2">
          <p class="font-medium text-sm">{{ review.userName }}</p>
          <div class="flex">
            <StarIcon v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'" />
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ review.comment }}</p>
        <p v-if="review.vendorReply" class="text-sm bg-gray-50 dark:bg-gray-800 p-3 mt-2 italic">Your reply: {{ review.vendorReply }}</p>
        <div v-else class="flex gap-2 mt-3">
          <input v-model="replyText[review.id]" placeholder="Write a reply..." class="input-field text-sm py-2 flex-1" />
          <button class="btn-primary text-sm py-2" @click="submitReply(review.id)">Reply</button>
        </div>
      </div>
    </div>
    <p v-else class="text-gray-500 text-center py-12">No reviews yet.</p>
  </div>
</template>
