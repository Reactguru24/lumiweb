<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { useThemeStore } from '@/stores/theme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  labels: string[]
  datasets: { label: string; data: number[]; color?: string }[]
  title?: string
}>()

const theme = useThemeStore()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    borderColor: ds.color || ['#1a1a1a', '#a88b73', '#2563eb'][i % 3],
    backgroundColor: (ds.color || '#1a1a1a') + '20',
    fill: true,
    tension: 0.4,
  })),
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: theme.isDark ? '#9ca3af' : '#6b7280' } },
    title: { display: !!props.title, text: props.title, color: theme.isDark ? '#fff' : '#1a1a1a' },
  },
  scales: {
    x: { ticks: { color: theme.isDark ? '#9ca3af' : '#6b7280' }, grid: { color: theme.isDark ? '#374151' : '#f3f4f6' } },
    y: { ticks: { color: theme.isDark ? '#9ca3af' : '#6b7280' }, grid: { color: theme.isDark ? '#374151' : '#f3f4f6' } },
  },
}))
</script>

<template>
  <div class="h-64">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
