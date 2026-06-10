'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorApi, reviewApi } from '@/lib/api/services'
import { StarIcon } from '@heroicons/react/24/solid'

export default function VendorReviewsPage() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const { data: vendor } = useQuery({ queryKey: ['my-vendor', auth.user?.id], queryFn: () => vendorApi.getByUserId(auth.user!.id) })
  const { data: reviews, isLoading } = useQuery({ queryKey: ['vendor-reviews', vendor?.id], queryFn: () => reviewApi.getByVendor(vendor!.id), enabled: !!vendor?.id })

  async function submitReply(reviewId: string) {
    const reply = replyText[reviewId]
    if (!reply?.trim()) return
    await reviewApi.reply(reviewId, reply)
    toast.success('Reply posted')
    setReplyText((prev) => ({ ...prev, [reviewId]: '' }))
    queryClient.invalidateQueries({ queryKey: ['vendor-reviews'] })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Customer Reviews</h1>
      {isLoading ? <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-24" />)}</div>
        : reviews?.length ? reviews.map((review) => (
          <div key={review.id} className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm">{review.userName}</p>
              <div className="flex">{[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
            {review.vendorReply ? <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 mt-2 italic">Your reply: {review.vendorReply}</p>
              : (
                <div className="flex gap-2 mt-3">
                  <input value={replyText[review.id] || ''} onChange={(e) => setReplyText({ ...replyText, [review.id]: e.target.value })} placeholder="Write a reply..." className="input-field text-sm py-2 flex-1" />
                  <button className="btn-primary text-sm py-2" onClick={() => submitReply(review.id)}>Reply</button>
                </div>
              )}
          </div>
        )) : <p className="text-gray-500 text-center py-12">No reviews yet.</p>}
    </div>
  )
}
