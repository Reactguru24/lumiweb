<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

export interface HeroSlide {
  label: string
  title: string
  subtitle: string
  image: string
  link: string
}

const props = defineProps<{ slides: HeroSlide[] }>()

const active = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function goTo(index: number) {
  active.value = (index + props.slides.length) % props.slides.length
}

function next() { goTo(active.value + 1) }
function prev() { goTo(active.value - 1) }

onMounted(() => {
  timer = setInterval(next, 6000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section class="relative min-h-[420px] h-[55vh] sm:h-[60vh] md:h-[75vh] overflow-hidden bg-gray-900">
    <div
      v-for="(slide, i) in slides"
      :key="slide.label"
      class="absolute inset-0 transition-opacity duration-700"
      :class="i === active ? 'opacity-100 z-10' : 'opacity-0 z-0'"
    >
      <img :src="slide.image" :alt="slide.title" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div class="absolute inset-0 flex items-center">
        <div class="max-w-7xl mx-auto px-4 w-full text-white">
          <p class="micro-label text-brand-orange mb-3">{{ slide.label }}</p>
          <h1 class="font-display text-2xl sm:text-4xl md:text-6xl font-semibold mb-3 sm:mb-4 max-w-xl leading-tight">{{ slide.title }}</h1>
          <p class="text-sm sm:text-lg text-gray-200 mb-6 sm:mb-8 max-w-md line-clamp-3 sm:line-clamp-none">{{ slide.subtitle }}</p>
          <router-link :to="slide.link" class="btn-primary bg-brand-orange text-white border-brand-orange hover:bg-brand-orange/90">
            Shop Collection
          </router-link>
        </div>
      </div>
    </div>

    <button class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white" aria-label="Previous slide" @click="prev">
      <ChevronLeftIcon class="w-5 h-5 sm:w-6 sm:h-6" />
    </button>
    <button class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white" aria-label="Next slide" @click="next">
      <ChevronRightIcon class="w-5 h-5 sm:w-6 sm:h-6" />
    </button>

    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="h-1.5 rounded-full transition-all"
        :class="i === active ? 'w-8 bg-brand-orange' : 'w-4 bg-white/50'"
        :aria-label="`Go to slide ${i + 1}`"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>
