<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores/auth'
import { vendorApi, productApi } from '@/api/services'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/storage'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ResponsiveDataTable from '@/components/common/ResponsiveDataTable.vue'
import type { TableColumn } from '@/components/common/ResponsiveDataTable.vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/common/Pagination.vue'

const auth = useAuthStore()
const toast = useToast()
const queryClient = useQueryClient()
const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  name: '', description: '', sku: '', category: 'men', subcategory: 'T-Shirts',
  brand: '', gender: 'men' as const, sizes: ['S', 'M', 'L'], price: 0, discount: 0, stock: 0,
})

const { data: vendor } = useQuery({
  queryKey: ['my-vendor', auth.user?.id],
  queryFn: () => vendorApi.getByUserId(auth.user!.id),
})

const { data: products, isLoading } = useQuery({
  queryKey: computed(() => ['vendor-products', vendor.value?.id]),
  queryFn: () => productApi.getAll({ vendorId: vendor.value!.id, status: undefined }),
  enabled: computed(() => !!vendor.value?.id),
})

const { page, totalPages, paginated, total, goTo, pageSize } = usePagination(products, 10)

const columns: TableColumn[] = [
  { key: 'name', label: 'Product', width: '30%' },
  { key: 'sku', label: 'SKU', width: '15%' },
  { key: 'price', label: 'Price', width: '15%', format: formatCurrency },
  { key: 'stock', label: 'Stock', width: '15%' },
  { key: 'status', label: 'Status', width: '15%' },
]

const tableData = computed(() =>
  paginated.value?.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images[0],
    sku: p.sku,
    price: p.price,
    stock: p.stock,
    status: p.status,
  })) ?? []
)

function resetForm() {
  form.value = { name: '', description: '', sku: '', category: 'men', subcategory: 'T-Shirts', brand: '', gender: 'men', sizes: ['S', 'M', 'L'], price: 0, discount: 0, stock: 0 }
  editingId.value = null
  showForm.value = false
}

function editProduct(p: typeof products.value extends (infer T)[] | undefined ? T : never) {
  editingId.value = p.id
  form.value = { name: p.name, description: p.description, sku: p.sku, category: p.category, subcategory: p.subcategory, brand: p.brand, gender: p.gender as 'men', sizes: p.sizes, price: p.price, discount: p.discount, stock: p.stock }
  showForm.value = true
}

async function saveProduct() {
  if (!vendor.value) return
  try {
    if (editingId.value) {
      await productApi.update(editingId.value, form.value)
      toast.success('Product updated')
    } else {
      await productApi.create(vendor.value.id, form.value)
      toast.success('Product created')
    }
    queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
    resetForm()
  } catch (e: unknown) {
    toast.error(e instanceof Error ? e.message : 'Failed')
  }
}

async function deleteProduct(id: string) {
  await productApi.update(id, { status: 'archived' })
  toast.success('Product archived')
  queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
}

async function removeProduct(id: string) {
  await productApi.delete(id)
  toast.success('Product deleted')
  queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 class="text-xl sm:text-2xl font-semibold">Products</h1>
      <button class="btn-primary text-sm py-2 flex items-center justify-center gap-2 w-full sm:w-auto" @click="showForm = true; editingId = null">
        <PlusIcon class="w-4 h-4" /> Add Product
      </button>
    </div>

    <div v-if="showForm" class="card p-6 mb-6 animate-slide-up">
      <h2 class="font-semibold mb-4">{{ editingId ? 'Edit' : 'Create' }} Product</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div><label class="text-sm font-medium">Name</label><input v-model="form.name" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">SKU</label><input v-model="form.sku" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Brand</label><input v-model="form.brand" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Category</label>
          <select v-model="form.category" class="input-field mt-1">
            <option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option>
            <option value="accessories">Accessories</option><option value="footwear">Footwear</option>
          </select>
        </div>
        <div><label class="text-sm font-medium">Subcategory</label><input v-model="form.subcategory" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Price</label><input v-model.number="form.price" type="number" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Discount %</label><input v-model.number="form.discount" type="number" class="input-field mt-1" /></div>
        <div><label class="text-sm font-medium">Stock</label><input v-model.number="form.stock" type="number" class="input-field mt-1" /></div>
        <div class="md:col-span-2"><label class="text-sm font-medium">Description</label><textarea v-model="form.description" rows="3" class="input-field mt-1" /></div>
      </div>
      <div class="flex gap-3 mt-4">
        <button class="btn-primary" @click="saveProduct">Save</button>
        <button class="btn-secondary" @click="resetForm">Cancel</button>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-3"><div v-for="i in 5" :key="i" class="skeleton h-16" /></div>
    <div v-else>
      <ResponsiveDataTable :columns="columns" :rows="tableData">
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <img :src="row.image" :alt="row.name" class="w-10 h-12 object-cover rounded" />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #actions="{ row }">
          <button class="p-1 hover:text-blue-600 transition-colors" @click="editProduct(products?.find(p => p.id === row.id)!)">
            <PencilIcon class="w-4 h-4" />
          </button>
          <button class="p-1 hover:text-yellow-600 transition-colors" @click="deleteProduct(row.id)">
            <TrashIcon class="w-4 h-4" />
          </button>
          <button class="p-1 hover:text-red-600 text-xs transition-colors" @click="removeProduct(row.id)">Del</button>
        </template>
      </ResponsiveDataTable>
    </div>
    <Pagination v-if="!isLoading && total > 0" :page="page" :total-pages="totalPages" :total="total" :page-size="pageSize" @update:page="goTo" />
  </div>
</template>
