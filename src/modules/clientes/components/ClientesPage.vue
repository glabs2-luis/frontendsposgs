<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="text-h6 text-primary">

        📋 Listado de Clientes
      </q-card-section>

      <q-separator />

      <!-- Tabla clientes -->
      <q-card-section>

        <!-- Input de búsqueda -->
        <q-input  v-model="filtro" debounce="300" flat
          placeholder="Buscar clientes" standard dense outlined class="q-mb-md"clearable
        ></q-input>

        <q-table :rows="clientes" :columns="columns" 
          row-key="ID_ACLIENTE" :filter="filtro" flat bordered no-data-label="No hay clientes registrados" >
          <template v-slot:body-cell-ACTION="props">
            <q-btn color="red" class="button" @click="eliminarClienteId(props.row.ID_ACLIENTE)">
            <q-icon name="delete"  />
          </q-btn> 

          <!-- Button Editar-->
           <q-btn color="yellow" class="button" @click="mutateActualizarClienteId(props.row.ID_ACLIENTE)">
            <q-icon name="edit"  />
          </q-btn> 


            <q-td :props="props">
            </q-td>
          </template>
        </q-table>

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
import { eliminarClienteIdAction } from '../action/clientes-action';


const { todosClientes, eliminarClienteId, mutateActualizarClienteId } = useClientes()

const filtro = ref('')
const modalEditar = ref(false)



const clientes = computed(() => todosClientes.value ?? [])

const columns : QTableColumn<Cliente>[] = [
  { name: 'ID_ACLIENTE', label: 'ID', field: 'ID_ACLIENTE', align: 'left' },
  { name: 'NOMBRE', label: 'Nombre', field: 'NOMBRE', align: 'left' },
  { name: 'NIT', label: 'NIT', field: 'NIT', align: 'left' },
  { name: 'DPI', label: 'DPI', field: 'DPI', align: 'left' },
  { name: 'DIRECCION', label: 'Dirección', field: 'DIRECCION', align: 'left' },
  { name: 'TELEFONO', label: 'Teléfono', field: 'TELEFONO', align: 'left' },
  { name: 'CORREO_ELECTRONICO', label: 'Correo', field: 'CORREO_ELECTRONICO', align: 'left' },
  { name: 'ACTION', label: 'Acciones', field: 'ACTION', align: 'left' }
  
] 






</script>

<style scoped>

.button {
  margin: 5px;
}


.filtro-cliente-elegante {
  background-color: #fffbe6; /* amarillo claro */
  border: 1px solid #e7e710; /* amarillo dorado */
  border-radius: 6px;
  font-size: 14px;
  padding: 2px 10px;
  height: 40px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filtro-cliente-elegante:hover {
  border-color: #ddc27e; /* tono más oscuro al pasar mouse */
}

.filtro-cliente-elegante:focus-within {
  border-color: #f3b24a;

}


</style>