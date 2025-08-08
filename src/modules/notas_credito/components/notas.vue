<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <div class="text-h6 text-deep-orange-10">Notas de Credito</div>

      <q-separator class="q-my-md" />

      <q-input
        v-model="filtro"
        label="Buscar nota"
        dense
        filled
        debounce="300"
        class="q-mb-md"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-list bordered separator v-if="notasFiltradas.length">
        <q-item v-for="nota in notasFiltradas" :key="nota.id">
          <q-item-section>
            <q-item-label class="text-bold">#{{ nota.codigo }} - {{ nota.titulo }}</q-item-label>
            <q-item-label class="text-grey-8">{{ nota.fecha }}</q-item-label>
            <q-item-label>{{ nota.descripcion }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="text-grey text-center q-mt-md">
        No se encontraron notas
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const filtro = ref('')

const notas = ref([
  { id: 1, codigo: 'N-001', titulo: 'Nota credito 1', descripcion: 'Pago de Q.2400.', fecha: '2024-06-03' },
  { id: 2, codigo: 'N-002', titulo: 'Nota credito 2', descripcion: 'Pago de Q.1200.', fecha: '2024-06-04' }
])

const notasFiltradas = computed(() => {
  return notas.value.filter(n =>
    n.titulo.toLowerCase().includes(filtro.value.toLowerCase()) ||
    n.descripcion.toLowerCase().includes(filtro.value.toLowerCase())
  )
})
</script>
