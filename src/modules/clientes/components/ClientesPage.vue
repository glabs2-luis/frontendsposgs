<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="text-h6 text-primary">
        📋 Listado de Clientes
      </q-card-section>

      <q-separator />

      <!-- Tabla clientes -->
      <q-card-section>
        <q-table :rows="clientes" :columns="columns"
          row-key="ID_ACLIENTE" flat bordered no-data-label="No hay clientes registrados" />

      </q-card-section> 


    </q-card>
  </div>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import type { QTableColumn } from 'quasar'
import { showErrorNotification } from '@/common/helper/notification'
import { Cliente } from '../interfaces/clientesInterface';
import { useClientes } from '../composables/use.clientes'


const { todosclientes } = useClientes({} as Cliente)

const clientes = computed(() => todosclientes.value ?? [])

const columns : QTableColumn<Cliente>[] = [
  { name: 'ID_ACLIENTE', label: 'ID', field: 'ID_ACLIENTE', align: 'left' },
  { name: 'NOMBRE', label: 'Nombre', field: 'NOMBRE', align: 'left' },
  { name: 'NIT', label: 'NIT', field: 'NIT', align: 'left' },
  { name: 'TELEFONO', label: 'Teléfono', field: 'TELEFONO', align: 'left' },
  { name: 'CORREO_ELECTRONICO', label: 'Correo', field: 'CORREO_ELECTRONICO', align: 'left' }
] 





</script>

<style scoped>


</style>