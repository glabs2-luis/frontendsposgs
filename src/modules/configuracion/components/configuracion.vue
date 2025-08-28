<template>
  <q-page class="q-pa-md">
    <!-- Título -->
    <q-card flat class="q-pa-md q-ml-lg">
      <q-card-section>
        <div class="text-h6 text-primary text-bold" color="primary">
          Configuracion del Sistema
        </div>
      </q-card-section>
    </q-card>

    <!-- Cambiar Serie de Facturación -->
    <q-card flat bordered class="q-pa-md">
      <q-expansion-item
        flat
        bordered
        class="text-h6 text-black prueba"
        icon="compare_arrows"
        label="Cambiar Serie de Facturación"
      >
        <q-separator class="q-my-md" />

        <q-card-section>
          <q-select
            v-model="serie"
            :options="seriesOptions"
            label="Seleccionar Serie"
            option-label="SERIE"
            option-value="SERIE"
            emit-value
            map-options
            @update:model-value="guardarSerieSeleccionada"
            dense
            filled
          />
          <q-banner class="q-mt-md bg-grey-2 text-dark" rounded>
            Serie activa:
            <strong>{{ configuracionStore.serieSeleccionada }}</strong>
          </q-banner>
        </q-card-section>
      </q-expansion-item>
    </q-card>

    <!-- Sincronizar Facturas -->
    <q-card flat bordered class="q-pa-md q-mt-md sync-card">
      <q-expansion-item
        icon="sync"
        flat
        bordered
        class="text-h6 text-black sync-expansion"
        label="Sincronizar Facturas"
        header-class="sync-header"
        expand-icon="expand_more"
        expanded-icon="expand_less"
      >
        <q-separator class="q-my-md" />

        <!-- Información de estado -->
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md items-center justify-center">
            <!-- Estado de conexión -->
            <div class="col-12 col-md-4 text-center">
              <div
                class="sync-status-card connection-status"
                :class="getConnectionStatusClass()"
              >
                <div class="row items-center q-gutter-sm">
                  <q-icon
                    :name="getConnectionIcon()"
                    size="32px"
                    :color="getConnectionIconColor()"
                  />
                  <div>
                    <div class="text-caption" :class="getConnectionTextClass()">
                      Estado de Conexión
                    </div>
                    <div
                      class="text-h6 text-weight-bold"
                      :class="getConnectionTextClass()"
                    >
                      {{ getConnectionStatusText() }}
                    </div>
                    <div class="text-subtitle2 text-weight-medium text-green-9">
                      Fecha de última revisión:
                      {{
                        archivosErrores?.timestamp
                          ? new Date(archivosErrores.timestamp).toLocaleString(
                              "es-GT",
                              {
                                dateStyle: "short",
                                timeStyle: "short",
                              }
                            )
                          : "Nunca"
                      }}
                    </div>
                  </div>
                </div>
                <!-- Indicador de estado -->
                <div
                  class="connection-indicator"
                  :class="getConnectionStatusClass()"
                ></div>
              </div>
            </div>

            <!-- Contador de facturas -->
            <div class="col-12 col-md-4 text-center">
              <div class="sync-status-card bg-blue-1">
                <div class="row items-center q-gutter-sm">
                  <q-icon name="receipt" size="32px" color="blue-7" />
                  <div>
                    <div class="text-caption text-blue-8">
                      Facturas Pendientes
                    </div>
                    <div class="text-h4 text-weight-bold text-blue-9">
                      {{ archivosErrores?.count || 0 }}
                    </div>
                    <div class="text-caption text-blue-8">
                      {{
                        archivosErrores?.count > 0
                          ? "Requieren sincronización"
                          : "Todo sincronizado"
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Acciones -->
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md justify-center">
            <div class="col-auto">
              <q-btn
                :disabled="!estadoConexion?.status"
                color="yellow-10"

                icon="sync"
                label="Sincronizar Ahora"
                size="lg"
                class="sync-btn"
                :loading="isReintentarEnviarArchivosPending"
                @click="reintentar"
              />
            </div>
          </div>
        </q-card-section>

        <!-- Mensaje informativo -->
        <q-card-section cen class="q-pt-none" v-if="estadoConexion?.status">
          <div class="info-section">
            <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded>
              <template #avatar>
                <q-icon name="sync" color="blue-7" />
              </template>
              <div class="text-body2">
                <strong>Sincronización automática:</strong> Las facturas se
                sincronizan automáticamente después de cada factura certificada
              </div>
            </q-banner>

            <q-banner class="bg-green-1 text-green-9" rounded>
              <template #avatar>
                <q-icon name="touch_app" color="green-7" />
              </template>
              <div class="text-body2">
                <strong>Sincronización Manual:</strong> Use el botón
                "Sincronizar Ahora" para forzar una sincronización inmediata de
                todas las facturas pendientes.
              </div>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none" v-else>
          <q-banner class="bg-red-1 text-red-9" rounded>
            <template #avatar>
              <q-icon name="error" color="red-7" />
            </template>
            <div class="text-body2">
              <strong>Estado de la conexión:</strong>
              {{ estadoConexion?.serverConnected }}
            </div>
          </q-banner>
        </q-card-section>
      </q-expansion-item>
    </q-card>

    <!-- Mensaje de conexión -->
    <q-dialog v-model="conexionMensaje" persistent>
      <q-card class="connection-modal">
        <q-card-section class="connection-modal-header">
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-sm">
              <q-icon
                :name="getConnectionIcon()"
                size="28px"
                :color="getConnectionIconColor()"
              />
              <div class="text-h6" :class="getConnectionTextClass()">
                Estado de la Conexión
              </div>
            </div>
            <q-btn
              flat
              icon="close"
              v-close-popup
              :color="getConnectionIconColor()"
              round
              dense
            />
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="connection-details">
            <!-- Estado principal -->
            <div class="connection-status-item">
              <div class="row items-center q-gutter-md">
                <q-icon
                  :name="getConnectionIcon()"
                  size="24px"
                  :color="getConnectionIconColor()"
                />
                <div>
                  <div class="text-subtitle2 text-grey-7">
                    Estado de Conexión
                  </div>
                  <div
                    class="text-h6 text-weight-bold"
                    :class="getConnectionTextClass()"
                  >
                    {{ getConnectionStatusText() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Servidor -->
            <div class="connection-status-item">
              <div class="row items-center q-gutter-md">
                <q-icon
                  name="dns"
                  size="24px"
                  :color="estadoConexion?.serverConnected ? 'green-7' : 'red-7'"
                />
                <div>
                  <div class="text-subtitle2 text-grey-7">Servidor</div>
                  <div
                    class="text-body1 text-weight-medium"
                    :class="
                      estadoConexion?.serverConnected
                        ? 'text-green-8'
                        : 'text-red-8'
                    "
                  >
                    {{
                      estadoConexion?.serverConnected ? "Activo" : "Inactivo"
                    }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Última revisión -->
            <div
              class="connection-status-item"
              v-if="estadoConexion?.FechaRevision"
            >
              <div class="row items-center q-gutter-md">
                <q-icon name="schedule" size="24px" color="blue-7" />
                <div>
                  <div class="text-subtitle2 text-grey-7">Última Revisión</div>
                  <div class="text-body1 text-weight-medium text-blue-8">
                    {{
                      new Date(estadoConexion.FechaRevision).toLocaleString(
                        "es-GT"
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cerrar"
            v-close-popup
            :color="getConnectionIconColor()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- shortcuts -->

    <q-card flat bordered class="q-pa-md q-mt-md">
      <q-expansion-item
        class="text-h6 text-black prueba"
        icon="keyboard_alt"
        label="Mostrar Atajos de Teclado"
        dense-toggle
        expand-icon="keyboard_arrow_down"
        header-class="text-black"
      >
        <q-markup-table flat bordered class="q-mt-md">
          <thead>
            <tr>
              <th class="text-left"><strong>Tecla</strong></th>
              <th class="text-left"><strong>Acción a Realizar</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <kbd><strong>Delete</strong></kbd>
              </td>
              <td>Limpiar pedido actual</td>
            </tr>

            <tr>
              <td>
                <kbd><strong>Enter</strong></kbd>
              </td>
              <td>Confirmar cantidad y cerrar ventana</td>
            </tr>

            <tr>
              <td>
                <kbd><strong>*</strong></kbd>
              </td>
              <td>Cambiar Cantidad de productos</td>
            </tr>

            <tr>
              <td>
                <kbd><strong>-</strong></kbd>
              </td>
              <td>Pedidos Pendientes</td>
            </tr>

            <tr>
              <td>
                <kbd><strong>F1</strong></kbd>
              </td>
              <td>Catalogo de Productos</td>
            </tr>

            <tr>
              <td>
                <kbd><strong>F2</strong></kbd>
              </td>
              <td>Consumidor Final (CF)</td>
            </tr>

            <tr>
              <td>
                <kbd><strong>F3</strong></kbd>
              </td>
              <td>Crear Pedido</td>
            </tr>

            <tr>
              <td>
                <kbd><strong>F4</strong></kbd>
              </td>
              <td>Facturar</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-expansion-item>
    </q-card>

    <!-- Mas configuraciones -->

    <q-page class="q-mt-lg">
      <!--<q-btn label="Actualizar bodega" color="black" @click="actualizarBodega" /> -->
    </q-page>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import useSeries from "../../fel_establecimiento_series/composables/useSeries";
import { useConfiguracionStore } from "@/stores/serie";
import {
  runWithLoading,
  showConfirmationDialog,
} from "@/common/helper/notification";

import { DataFactura } from "@/modules/facturar_pdf/interfaces/pdfInterface";
import { usePdfFactura } from "@/modules/facturar_pdf/composables/usePdFactura";
const { generarFacturaPDF } = usePdfFactura();
// Store
const configuracionStore = useConfiguracionStore();
const { seriesSucursal } = useSeries();

// sync
import { useSync } from "@/modules/sync/composables/useSync";
const {
  refetchArchivosCreados,
  archivosTransferidos,
  refetchArchivosTransferidos,
  refetchArchivosErrores,
  mutateReintentarEnviarArchivos,
  archivosErrores,
  estadoConexion,
  isReintentarEnviarArchivosPending,
} = useSync();

// Parámetros
const idSucursal = ref(1);
const serie = ref(configuracionStore.serieSeleccionada || "");
const conexionMensaje = ref(false);

const { data: series, isLoading, error } = seriesSucursal(idSucursal.value);

// Funcion para enviar archivos
const reintentar = () => {
  mutateReintentarEnviarArchivos();
};

const seriesOptions = computed(() => {
  return series.value?.map((item: any) => item.SERIE) || [];
});

// Guardar selección en el store
const guardarSerieSeleccionada = async (valor: string) => {
  const confirmado = await showConfirmationDialog(
    "Serie",
    "¿Está seguro que desea actualizar la serie?"
  );

  if (confirmado) {
    configuracionStore.setSerieSeleccionada(valor);
  }
};

// mostrar la conexion de la base de datos
const mostrarConexion = () => {
  conexionMensaje.value = true;
};

// ===== FUNCIONES HELPER PARA ESTADO DE CONEXIÓN =====

// Obtener clase CSS para el estado de conexión
const getConnectionStatusClass = () => {
  if (!estadoConexion.value?.status) return "connection-offline";
  return estadoConexion.value.status
    ? "connection-online"
    : "connection-offline";
};

// Obtener icono para el estado de conexión
const getConnectionIcon = () => {
  if (!estadoConexion.value?.status) return "wifi_off";
  return estadoConexion.value.status ? "wifi" : "wifi_off";
};

// Obtener color del icono para el estado de conexión
const getConnectionIconColor = () => {
  if (!estadoConexion.value?.status) return "grey-6";
  return estadoConexion.value.status ? "green-7" : "red-7";
};

// Obtener clase CSS para el texto del estado de conexión
const getConnectionTextClass = () => {
  if (!estadoConexion.value?.status) return "text-grey-6";
  return estadoConexion.value.status ? "text-green-8" : "text-red-8";
};

// Obtener texto del estado de conexión
const getConnectionStatusText = () => {
  if (!estadoConexion.value?.status) return "Desconocido";
  return estadoConexion.value.status ? "Conectado" : "Desconectado";
};

function ListaDet1(idPedidoEnc: any): {
  data: any;
  isLoading: any;
  refetch: any;
} {
  throw new Error("Function not implemented.");
}
</script>

<style scoped>
.prueba {
  color: #212121;
  border-radius: 8px;
  border: 1px solid #faf9b8;
  transition: all 0.3s ease;
  margin-bottom: 0;
  padding: 0 0 0 0;
}

/* ===== ESTILOS PARA SINCRONIZACIÓN PROFESIONAL ===== */

.sync-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.sync-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.sync-expansion {
  border-radius: 12px;
  overflow: hidden;
}

.sync-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  font-weight: 600;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

.sync-header .q-expansion-item__toggle-icon {
  color: white;
}

.sync-status-card {
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.sync-status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.sync-status-card.bg-blue-1 {
  border-color: rgba(25, 118, 210, 0.2);
}

.sync-status-card.bg-green-1 {
  border-color: rgba(76, 175, 80, 0.2);
}

.sync-btn {
  color: yellow;
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.sync-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
}

.info-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
  border-width: 2px;
}

.info-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(156, 39, 176, 0.3);
}

/* ===== ESTILOS PARA ESTADO DE CONEXIÓN ===== */

.connection-status {
  position: relative;
  overflow: hidden;
}

.connection-status.connection-online {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: rgba(76, 175, 80, 0.3);
}

.connection-status.connection-offline {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: rgba(244, 67, 54, 0.3);
}

.connection-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  transition: all 0.3s ease;
}

.connection-indicator.connection-online {
  background: linear-gradient(to bottom, #4caf50, #2e7d32);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.connection-indicator.connection-offline {
  background: linear-gradient(to bottom, #f44336, #c62828);
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

/* ===== ESTILOS PARA MODAL DE CONEXIÓN ===== */

.connection-modal {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.connection-modal-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #dee2e6;
  padding: 20px;
}

.connection-details {
  padding: 16px 0;
}

.connection-status-item {
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.connection-status-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.connection-status-item:last-child {
  margin-bottom: 0;
}

/* ===== ESTILOS PARA SECCIÓN DE INFORMACIÓN ===== */

.info-section {
  padding: 8px 0;
}

.info-section .q-banner {
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.info-section .q-banner:first-child {
  border-left-color: #1976d2;
}

.info-section .q-banner:last-child {
  border-left-color: #388e3c;
}

/* Responsive */
@media (max-width: 768px) {
  .sync-status-card {
    margin-bottom: 16px;
  }

  .sync-btn,
  .info-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
