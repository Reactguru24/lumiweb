<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useThemeStore } from '@/stores/theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  data: number[]
  label?: string
  title?: string
  color?: string
}>()

const theme = useThemeStore()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    label: props.label || 'Value',
    data: props.data,
    backgroundColor: props.color || '#1a1a1a',
    borderRadius: 4,
  }],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: !!props.title, text: props.title, color: theme.isDark ? '#fff' : '#1a1a1a' },
  },
  scales: {
    x: { ticks: { color: theme.isDark ? '#9ca3af' : '#6b7280' }, grid: { display: false } },
    y: { ticks: { color: theme.isDark ? '#9ca3af' : '#6b7280' }, grid: { color: theme.isDark ? '#374151' : '#f3f4f6' } },
  },
}))
</script>

<template>
  <div class="h-64">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
