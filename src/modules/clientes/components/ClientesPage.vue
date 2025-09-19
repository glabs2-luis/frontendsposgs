<template>
  <div class="q-pa-md clientes-wrapper">
    <div class="clientes-container">
      <q-card class="clientes-card glass-card">
        <q-card-section class="row items-center justify-between header-bar">
          <div class="text-h6 text-primary titulo-card">
            Listado de Clientes
          </div>

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
            placeholder="Buscar clientes por nombre o nit"
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
            :pagination="{ page: 1, rowsPerPage: 50 }"
            class="clientes-table"
            :rows-per-page-options="[25, 50, 100]"
            dense
          >
            <!-- Template para acciones -->
            <template v-slot:body-cell-ACTION="props">
              <q-td :props="props">
                <div class="action-buttons">
                  <q-btn
                    color="negative"
                    class="button button-danger"
                    @click="eliminarClienteId(props.row.ID_ACLIENTE)"
                    round
                    dense
                    flat
                    size="sm"
                  >
                    <q-icon name="delete" />
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>

                  <q-btn
                    color="warning"
                    class="button button-warning"
                    @click="abrirModalEdicion(props.row)"
                    round
                    dense
                    flat
                    size="sm"
                  >
                    <q-icon name="edit" />
                    <q-tooltip>Editar</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRaw } from "vue";
import type { QTableColumn } from "quasar";
import { Cliente } from "../interfaces/clientesInterface";
import { useClientes } from "../composables/useClientes";
import ModalEditarCliente from "@/modals/modalEditarCliente.vue";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/common/helper/notification";

const {
  todosClientes,
  eliminarClienteId,
  mutateActualizarClienteId2,
  mutateCrearCliente,
} = useClientes();
const filtro = ref("");
const modalEditar = ref(false);
const clientes = computed(() => todosClientes.value ?? []);
const clienteSeleccionado = ref<Cliente | null>(null);
const esNuevo = ref(false);

const columns: QTableColumn<Cliente>[] = [
  {
    name: "ID_ACLIENTE",
    label: "ID",
    field: "ID_ACLIENTE",
    align: "center",
    style: "width: 45px",
  },
  {
    name: "NOMBRE",
    label: "Nombre",
    field: "NOMBRE",
    align: "left",
    style: "width: 100px",
  },
  {
    name: "NIT",
    label: "NIT",
    field: "NIT",
    align: "left",
    style: "width: 50px",
  },
  {
    name: "DIRECCION",
    label: "Dirección",
    field: "DIRECCION",
    align: "left",
    style: "width: 100px",
  },
  {
    name: "DPI",
    label: "DPI",
    field: "DPI",
    align: "left",
    style: "width: 70px",
  },
  {
    name: "TELEFONO",
    label: "Teléfono",
    field: "TELEFONO",
    align: "left",
    style: "width: 50px",
  },
  {
    name: "CORREO_ELECTRONICO",
    label: "Correo",
    field: "CORREO_ELECTRONICO",
    align: "left",
    style: "width: 70px",
  },
  {
    name: "ACTION",
    label: "Acciones",
    field: "ACTION",
    align: "center",
    style: "width: 90px",
  },
];

// Modal de edición
function abrirModalEdicion(cliente: Cliente) {
  clienteSeleccionado.value = { ...cliente };
  esNuevo.value = false;
  modalEditar.value = true;
}

//modal de creación
function abrirModalCrearCliente() {
  clienteSeleccionado.value = {
    NOMBRE: "",
    NIT: "",
    DPI: "",
    DIRECCION: "",
    TELEFONO: "",
    CORREO_ELECTRONICO: "",
  } as Cliente;
  esNuevo.value = true;
  modalEditar.value = true;
}

function guardarCliente(cliente: Cliente) {
  if (esNuevo.value) {
    // Limpiar y preparar el cliente
    const clientePlano: Partial<Cliente> = {
      ...cliente,
      NOMBRE: cliente.NOMBRE,
      NIT: cliente.NIT,
      DPI: cliente.DPI?.trim() || "",
      DIRECCION: cliente.DIRECCION,
      TELEFONO: cliente.TELEFONO?.toString() || "",
    };

    // Eliminar el correo si está vacío
    if (
      !cliente.CORREO_ELECTRONICO ||
      cliente.CORREO_ELECTRONICO.trim() === ""
    ) {
      delete clientePlano.CORREO_ELECTRONICO;
    } else {
      clientePlano.CORREO_ELECTRONICO = cliente.CORREO_ELECTRONICO.trim();
    }

    mutateCrearCliente(clientePlano, {
      onSuccess: () => {
        showSuccessNotification(
          "Nuevo Cliente",
          "Cliente creado satisfactoriamente"
        );
        modalEditar.value = false;
      },
      onError: (error) => {
        showErrorNotification("Error", "No se pudo crear el cliente");
      },
    });
  } else {
    // Mantener la parte de actualización tal como está
    const { ID_ACLIENTE, ...datosActualizados } = cliente;

    mutateActualizarClienteId2(
      { id: ID_ACLIENTE, data: datosActualizados },
      {
        onSuccess: () => {
          showSuccessNotification(
            "Cliente Actualizado",
            "Cliente actualizado satisfactoriamente"
          );
          modalEditar.value = false;
        },
        onError: () => {
          showErrorNotification("Error", "No se pudo actualizar el cliente");
        },
      }
    );
  }
}
</script>

<style scoped>
.clientes-wrapper {
  background: linear-gradient(180deg, #f8faf0 0%, #f1f3d4 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clientes-container {
  width: 100%;

  margin: 0 auto;
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
  background: linear-gradient(
    135deg,
    rgba(218, 246, 59, 0.06),
    rgba(218, 238, 36, 0)
  );
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
  background: linear-gradient(135deg, #fff9db 0%, #fae4a2 100%);
}
.clientes-table :deep(th) {
  font-weight: 600;
  color: #495057;
  letter-spacing: 0.2px;
  padding: 6px 4px;
  font-size: 11px;
  text-transform: uppercase;
}
.clientes-table :deep(tbody tr) {
  transition: background-color 0.15s ease, transform 0.06s ease;
}
.clientes-table :deep(tbody tr:hover) {
  background: linear-gradient(135deg, #fcf5d6 0%, #fae4a2 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(251, 192, 45, 0.2);
}
.clientes-table :deep(td) {
  vertical-align: middle;
  padding: 6px 4px;
  font-size: 12px;
}

/* Estilos para columnas específicas */
.clientes-table :deep(.q-table__col-ID_ACLIENTE) {
  font-weight: 600;
  color: #fbc02d;
}

.clientes-table :deep(.q-table__col-NOMBRE) {
  font-weight: 500;
  color: #2c3e50;
}

.clientes-table :deep(.q-table__col-NIT) {
  font-family: monospace;
  color: #495057;
}

.clientes-table :deep(.q-table__col-DIRECCION) {
  color: #6c757d;
  font-size: 12px;
}

.clientes-table :deep(.q-table__col-DPI) {
  font-family: monospace;
  color: #495057;
  font-size: 12px;
}

.clientes-table :deep(.q-table__col-TELEFONO) {
  color: #495057;
  font-size: 12px;
}

.clientes-table :deep(.q-table__col-CORREO_ELECTRONICO) {
  color: #6c757d;
  font-size: 12px;
}

/* Manejo de texto largo */
.clientes-table :deep(.q-table__col-NOMBRE),
.clientes-table :deep(.q-table__col-DIRECCION),
.clientes-table :deep(.q-table__col-CORREO_ELECTRONICO) {
  word-break: break-word;
  max-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clientes-table :deep(.q-table__col-NOMBRE):hover,
.clientes-table :deep(.q-table__col-DIRECCION):hover,
.clientes-table :deep(.q-table__col-CORREO_ELECTRONICO):hover {
  overflow: visible;
  white-space: normal;
  word-break: break-word;
  position: relative;
  z-index: 1;
  background: white;
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
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
  .clientes-wrapper {
    padding: 16px 8px;
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 20px;
  }

  .clientes-container {
    max-width: 100%;
    padding: 0 8px;
  }

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

  .clientes-table :deep(th),
  .clientes-table :deep(td) {
    padding: 4px 3px;
    font-size: 10px;
  }

  .clientes-table :deep(th) {
    font-size: 9px;
  }

  .action-buttons {
    gap: 2px;
  }
}

@media (max-width: 480px) {
  .clientes-wrapper {
    padding: 8px 4px;
    padding-top: 16px;
  }

  .clientes-container {
    padding: 0 4px;
  }

  .cliente-datos-extra {
    display: none; /* Ocultar información extra en pantallas muy pequeñas */
  }

  .clientes-table :deep(.q-table__container) {
    font-size: 12px;
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
