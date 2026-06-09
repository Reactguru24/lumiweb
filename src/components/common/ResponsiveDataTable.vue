<template>
  <!-- Mobile: Card view -->
  <div class="md:hidden space-y-4">
    <div v-for="row in rows" :key="row.id" class="card p-4 space-y-3">
      <div v-for="(column, idx) in columns" :key="idx" class="flex justify-between items-start gap-2">
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-fit">{{ column.label }}</span>
        <div class="text-right flex-1 text-sm">
          <slot :name="`cell-${column.key}`" :row="row" :column="column">
            {{ getCellValue(row, column) }}
          </slot>
        </div>
      </div>
      <!-- Actions slot for mobile -->
      <div v-if="$slots.actions" class="flex gap-2 flex-wrap justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
        <slot name="actions" :row="row" />
      </div>
    </div>
  </div>

  <!-- Desktop: Table view -->
  <div class="hidden md:block table-responsive">
    <table class="data-table">
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th v-for="column in columns" :key="column.key" class="text-left p-4 font-semibold text-gray-700 dark:text-gray-300" :style="{ width: column.width }">
            {{ column.label }}
          </th>
          <th v-if="$slots.actions" class="text-right p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id" class="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <td v-for="column in columns" :key="column.key" class="p-4 text-sm" :style="{ width: column.width }">
            <slot :name="`cell-${column.key}`" :row="row" :column="column">
              {{ getCellValue(row, column) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="p-4 text-right">
            <div class="flex gap-1 justify-end">
              <slot name="actions" :row="row" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Empty state -->
  <div v-if="!rows.length" class="text-center py-12">
    <p class="text-gray-500 dark:text-gray-400">No data available</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TableColumn {
  key: string
  label: string
  width?: string
  format?: (value: any) => string
}

export interface TableRow {
  id: string | number
  [key: string]: any
}

interface Props {
  columns: TableColumn[]
  rows: TableRow[]
}

withDefaults(defineProps<Props>(), {})

const getCellValue = (row: TableRow, column: TableColumn): string => {
  const value = row[column.key]
  if (column.format) {
    return column.format(value)
  }
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>
