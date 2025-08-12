<template>
  <div class="q-pa-md clientes-wrapper">
    <q-card class="clientes-card glass-card">
      <q-card-section class="row items-center justify-between header-bar">
        <div class="text-h6 text-primary titulo-card">📋 Listado de Clientes</div>

        <q-btn
          icon="add"
          round
          dense
          flat
          label="Crear Cliente"
          class="q-mr-sm button boton-amarillo"
          @click="abrirModalCrearCliente"
        />
      </q-card-section>

      <q-separator />

      <!-- Tabla clientes -->
      <q-card-section class="contenido-card">
        <!-- Input de búsqueda -->
        <q-input
          v-model="filtro"
          debounce="300"
          flat
          placeholder="Buscar clientes"
          standard
          dense
          outlined
          clearable
          class="q-mb-md search-input"
          autofocus
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="clientes"
          :columns="columns"
          row-key="ID_ACLIENTE"
          :filter="filtro"
          flat
          bordered
          no-data-label="No hay clientes registrados"
          :pagination="{ page: 1, rowsPerPage: 100 }"
          class="clientes-table"
        >
          <template v-slot:body-cell-ACTION="props">
            <q-btn
              color="red"
              class="button button-danger q-mr-xs"
              @click="eliminarClienteId(props.row.ID_ACLIENTE)"
              round
              dense
              flat
            >
              <q-icon name="delete" />
            </q-btn>

            <!-- Button Editar-->
            <q-btn
              color="yellow"
              class="button button-warning"
              @click="abrirModalEdicion(props.row)"
              round
              dense
              flat
            >
              <q-icon name="edit" />
            </q-btn>

            <q-td :props="props"> </q-td>
          </template>
        </q-table>
      </q-card-section>

      <ModalEditarCliente
        v-if="clienteSeleccionado"
        v-model="modalEditar"
        :cliente="clienteSeleccionado"
        :modo="esNuevo ? 'crear' : 'editar'"
        @guardar="guardarCliente"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">

import { ref, computed, toRaw } from 'vue'
import type { QTableColumn } from 'quasar'
import { Cliente } from '../interfaces/clientesInterface';
import { useClientes } from '../composables/useClientes'
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
  { name: 'DIRECCION', label: 'Dirección', field: 'DIRECCION', align: 'left' },
  { name: 'DPI', label: 'DPI', field: 'DPI', align: 'left' },
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

.clientes-wrapper {
  background: linear-gradient(180deg, #f8faf0 0%, #f1f3d4 100%);
  min-height: 100%;
}

.glass-card {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.header-bar {
  background: linear-gradient(135deg, rgba(218, 246, 59, 0.06), rgba(218, 238, 36, 0));
  border-bottom: 1px solid rgba(218, 229, 166, 0.2);
}

.titulo-card {
  color: yellow;
  letter-spacing: 0.2px;
}

.contenido-card {
  padding-top: 18px;
}

.search-input :deep(.q-field__control) {
  border-radius: 12px !important;
}
.search-input :deep(.q-field__native) {
  transition: transform 0.12s ease;
}
.search-input :deep(.q-field__control:focus-within) {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

/* Tabla */
.clientes-table :deep(.q-table__container) {
  border-radius: 12px;
  overflow: hidden;
}
.clientes-table :deep(thead tr) {
  background: #f8fafc;
}
.clientes-table :deep(th) {
  font-weight: 600;
  color: #334155;
  letter-spacing: 0.2px;
}
.clientes-table :deep(tbody tr) {
  transition: background-color 0.15s ease, transform 0.06s ease;
}
.clientes-table :deep(tbody tr:hover) {
  background: #f1f5f9;
}
.clientes-table :deep(td) {
  vertical-align: middle;
}

/* Botones */
.button {
  padding: auto;
  border-radius: 8px;
  transition: transform 0.08s ease, box-shadow 0.15s ease, background 0.2s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}
.button:active {
  transform: translateY(1px);
}

.button-primary {
  background: rgba(59, 130, 246, 0.12) !important;
}
.button-primary:hover {
  background: rgba(59, 130, 246, 0.2) !important;
}

.button-warning {
  background: rgba(250, 204, 21, 0.18) !important;
}
.button-warning:hover {
  background: rgba(250, 204, 21, 0.26) !important;
}

.button-danger {
  background: rgba(239, 68, 68, 0.12) !important;
}
.button-danger:hover {
  background: rgba(239, 68, 68, 0.2) !important;
}

/* Responsivo: compactar paddings en pantallas pequeñas */
@media (max-width: 768px) {
  .glass-card {
    border-radius: 12px;
  }
  .header-bar {
    padding: 8px 10px !important;
  }
  .titulo-card {
    font-size: 1.05rem !important;
  }
  .search-input {
    margin-bottom: 10px;
  }
}

.boton-amarillo {
  background: linear-gradient(90deg, #ffeb3b, #fbc02d);
  color: #070606;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.boton-amarillo:hover {
  background: linear-gradient(90deg, #fbc02d, #f9a825);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}


</style>