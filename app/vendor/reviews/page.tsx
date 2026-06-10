'use client'

import { useState } from 'react'
import { useLocalData } from '@/lib/data/hooks'
import { notifyLocalDataChange } from '@/lib/data/events'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/stores/auth'
import { vendorData, reviewData } from '@/lib/data/services'
import { StarIcon } from '@heroicons/react/24/solid'

export default function VendorReviewsPage() {
  const auth = useAuthStore()
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const vendor = useLocalData(() => auth.user ? vendorData.getByUserId(auth.user.id) : null)
  const reviews = useLocalData(() => vendor ? reviewData.getByVendor(vendor.id) : [])

  function submitReply(reviewId: string) {
    const reply = replyText[reviewId]
    if (!reply?.trim()) return
    reviewData.reply(reviewId, reply)
    toast.success('Reply posted')
    setReplyText((prev) => ({ ...prev, [reviewId]: '' }))
    notifyLocalDataChange()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Customer Reviews</h1>
      {reviews.length ? reviews.map((review) => (
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
