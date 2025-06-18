<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <div class="text-h6 text-indigo-10">Historial de Facturas</div>

      <q-separator class="q-my-md" />

      <q-input
        v-model="filtro"
        label="Buscar por cliente o número"
        dense
        filled
        debounce="300"
        class="q-mb-md"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-list bordered separator v-if="facturasFiltradas.length">
        <q-item v-for="factura in facturasFiltradas" :key="factura.id">
          <q-item-section>
            <q-item-label class="text-bold">Factura: {{ factura.numero }}</q-item-label>
            <q-item-label>Cliente: {{ factura.cliente }}</q-item-label>
            <q-item-label>Total: Q{{ factura.total.toFixed(2) }}</q-item-label>
            <q-item-label>Fecha: {{ factura.fecha }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="text-grey text-center q-mt-md">No hay facturas encontradas</div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const filtro = ref('')

const facturas = ref([
  { id: 1, numero: 'F-001', cliente: 'Juan Pérez', total: 150, fecha: '2024-06-01' },
  { id: 2, numero: 'F-002', cliente: 'Ana López', total: 200, fecha: '2024-06-02' }
])

const facturasFiltradas = computed(() => {
  return facturas.value.filter(f =>
    f.numero.toLowerCase().includes(filtro.value.toLowerCase()) ||
    f.cliente.toLowerCase().includes(filtro.value.toLowerCase())
  )
})
</script>
