<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section div class="row items-center justify-between">

        <div class="text-h6 text-primary">📋 Listado de Clientes</div>

        <q-btn icon="add" round dense flat justify-end label="Crear Cliente"
          class="q-mr-sm" @click="abrirModalCrearCliente"/>

      </q-card-section>

      <q-separator />

      <!-- Tabla clientes -->
      <q-card-section>

        <!-- Input de búsqueda -->
        <q-input  v-model="filtro" debounce="300" flat
          placeholder="Buscar clientes" standard dense outlined class="q-mb-md" clearable
        ></q-input>

        <q-table :rows="clientes" :columns="columns" row-key="ID_ACLIENTE" :filter="filtro" flat bordered no-data-label="No hay clientes registrados" :pagination="{ page: 1, rowsPerPage: 100 }">
          <template v-slot:body-cell-ACTION="props">
            <q-btn color="red" class="button" @click="eliminarClienteId(props.row.ID_ACLIENTE)">
            <q-icon name="delete"  />
          </q-btn> 

          <!-- Button Editar-->
            <q-btn color="yellow" class="button" @click="abrirModalEdicion(props.row)"> 
              <q-icon name="edit" />
            </q-btn> 

            <q-td :props="props">
            </q-td>
          </template>
        </q-table>

      </q-card-section>

        <ModalEditarCliente
         v-if="clienteSeleccionado" 
         v-model="modalEditar"
         :cliente="clienteSeleccionado"
         :modo="esNuevo ? 'crear' : 'editar'"
        @guardar="guardarCliente"/>

    </q-card>
  </div>

</template>

<script setup lang="ts">

import { ref, computed, toRaw } from 'vue'
import type { QTableColumn } from 'quasar'
import { Cliente } from '../interfaces/clientesInterface';
import { useClientes } from '../composables/useClientes'
import { eliminarClienteIdAction, crearClientesAction } from '../action/clientesAction';
import ModalEditarCliente from '@/modals/modalEditarCliente.vue';
import { showErrorNotification, showSuccessNotification } from '@/common/helper/notification';

const { todosClientes, eliminarClienteId, mutateActualizarClienteId2, mutateCrearCliente } = useClientes()
const filtro = ref('')
const modalEditar = ref(false)
const clientes = computed(() => todosClientes.value ?? [])
const clienteSeleccionado = ref<Cliente | null>(null)
const esNuevo = ref(false)

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

// Modal de edición
function abrirModalEdicion(cliente: Cliente) {
  clienteSeleccionado.value = { ...cliente } 
  esNuevo.value = false
  modalEditar.value = true
}

//modal de creación
function abrirModalCrearCliente() {
  clienteSeleccionado.value = {
    NOMBRE: '',
    NIT: '',
    DPI: '',
    DIRECCION: '',
    TELEFONO: '',
    CORREO_ELECTRONICO: ''
  } as Cliente
  esNuevo.value = true
  modalEditar.value = true
}

function guardarCliente(cliente: Cliente) {
  
  if (esNuevo.value) {
    // Limpiar y preparar el cliente
    const clientePlano: Partial<Cliente> = {
      ...cliente,
      NOMBRE: cliente.NOMBRE,
      NIT: cliente.NIT,
      DPI: cliente.DPI?.trim() || '',
      DIRECCION: cliente.DIRECCION,
      TELEFONO: cliente.TELEFONO?.toString() || '',
    }

    // Eliminar el correo si está vacío
    if (!cliente.CORREO_ELECTRONICO || cliente.CORREO_ELECTRONICO.trim() === '') {
      delete clientePlano.CORREO_ELECTRONICO
    } else {
      clientePlano.CORREO_ELECTRONICO = cliente.CORREO_ELECTRONICO.trim()
    }

    mutateCrearCliente(clientePlano, {
      onSuccess: () => {
        showSuccessNotification('Nuevo Cliente', 'Cliente creado satisfactoriamente')
        modalEditar.value = false
      },
      onError: (error) => {
        console.error('Error creando cliente:', error)
        showErrorNotification('Error', 'No se pudo crear el cliente')
      }
    })

  } else {
    // Mantener la parte de actualización tal como está
    const { ID_ACLIENTE, ...datosActualizados } = cliente

    mutateActualizarClienteId2({ id: ID_ACLIENTE, data: datosActualizados }, {
      onSuccess: () => {
        showSuccessNotification('Cliente Actualizado', 'Cliente actualizado satisfactoriamente')
        modalEditar.value = false
      },
      onError: () => {
        showErrorNotification('Error', 'No se pudo actualizar el cliente')
      }
    })
  }
}

</script>


<style scoped>

.button {
  margin: 5px;
}

.filtro-cliente-elegante {
  background-color: #fffbe6; 
  border: 1px solid #e7e710; 
  border-radius: 6px;
  font-size: 14px;
  padding: 2px 10px;
  height: 40px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filtro-cliente-elegante:hover {
  border-color: #ddc27e; 
}

.filtro-cliente-elegante:focus-within {
  border-color: #f3b24a;
}

</style>