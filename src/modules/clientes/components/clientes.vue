<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-table
        title="Listado de Clientes"
        :rows="clientes"
        :columns="columnas"
        row-key="id"
        flat
        dense
        :pagination="{ rowsPerPage: 5 }"
        no-data-label="No hay clientes registrados"
      >
        <template v-slot:body-cell-acciones="props">
          <q-td align="center">
            <q-btn
              flat
              dense
              icon="visibility"
              color="primary"
              size="sm"
              @click="verCliente(props.row)"
            />
            <q-btn
              flat
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click="eliminarCliente(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import type { QTableColumn } from 'quasar'


const filtro = ref('')

const columnas: QTableColumn[] = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'documento', label: 'DPI/NIT', field: 'documento', align: 'left', sortable: true },
  { name: 'direccion', label: 'Dirección', field: 'direccion', align: 'left' },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' }
]



const clientes = ref([
  // Datos de ejemplo (serán reemplazados por datos reales del backend)
  {
    id: 1,
    nombre: 'Juan Pérez',
    documento: '12345678',
    direccion: 'Zona 1, Ciudad',
    telefono: '5555-1234',
    email: 'juan@mail.com'
  },
  {
    id: 2,
    nombre: 'Ana García',
    documento: 'CF',
    direccion: 'Ciudad',
    telefono: '5555-5678',
    email: 'ana@mail.com'
  }
])

const clientesFiltrados = computed(() => {
  if (!filtro.value) return clientes.value
  return clientes.value.filter(c =>
    c.nombre.toLowerCase().includes(filtro.value.toLowerCase()) ||
    c.documento.toLowerCase().includes(filtro.value.toLowerCase())
  )
})

const pagination = ref({
  rowsPerPage: 10
})

const verCliente = (cliente: any) => {
  console.log('Ver cliente:', cliente)
}

const eliminarCliente = (id: number) => {
  clientes.value = clientes.value.filter(c => c.id !== id)
}

</script>

