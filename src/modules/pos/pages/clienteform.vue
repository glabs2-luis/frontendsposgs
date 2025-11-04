<template>
  <div class="row">
    <div class="col-12">
      <!-- informacion mas pedido y cantidad-->
      <div class="row items-start q-gutter-sm">
        <!-- Boton para Cotizacion y pedido -->
        <div class="tipo-transaccion-container">
          <div class="q-gutter-y-md">
            <q-btn-toggle
              v-model="estadoPedido"
              unelevated
              spread
              no-caps
              toggle-color="yellow-9"
              color="grey-1"
              text-color="black"
              :options="[
                { label: 'Pedido', value: 'pedido' },
                ...(userStore.tipoUsuarioStore === 'POS' ? [{ label: 'Cotizacion', value: 'cotización' }] : []),
              ]"
              class="tipo-transaccion-toggle"
              :disable="!!mostrarNumPedido"
            />
          </div>
        </div>

        <!-- ExpansionItem -->
        <div class="col-9 col-md">
          <q-expansion-item
            ref="expansion"
            v-model="expansionCliente"
            icon="person"
            label="Información del Cliente"
            lazy-rules
            expand-separator
            header-class="bg-yellow-1 text-black"
          >
            <template #header>
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>

              <q-item-section>
                <q-item-label>Información del Cliente</q-item-label>
                <q-item-label
                  caption
                  class="text-black text-weight-bold ellipsis"
                >
                  {{ clienteStore.documento }} - {{ clienteStore.nombre }} -
                  {{ clienteStore.direccion }}
                </q-item-label>
              </q-item-section>
            </template>

            <q-card
              flat
              bordered
              class="q-pa-xs bg-grey-1"
              style="border-radius: 6px"
            >
              <div class="q-pa-sm">
                <q-form ref="formRef" lazy-validation>
                  <div class="row q-col-gutter-xs">
                    <q-option-group
                      class="q-mr-md"
                      v-model="tipoDocumento"
                      :options="[
                        { label: 'NIT', value: 'nit' },
                        { label: 'DPI', value: 'dpi' },
                      ]"
                      type="radio"
                      inline
                    />

                    <!-- Rules:  :rules="[(val) => !!val || 'Requerido']"  -->

                    <!-- Campo de búsqueda de cliente -->
                    <div class="col-4">
                      <!-- DPI-->
                      <q-input
                        ref="focus"
                        v-model="clienteStore.documento"
                        label="NIT/DPI"
                        dense
                        outlined
                        lazy-rules
                        hide-bottom-space
                        style="font-size: 13px"
                        @keydown.enter.prevent="buscarClienteDPINIT2"
                        @update:model-value="clienteStore.nombre = ''; clienteStore.direccion = '';"
                        @keydown="usarF2"
                        >
                        <template v-slot:append>
                          <q-btn
                            flat
                            dense
                            icon="search"
                            color="primary"
                            @click="crearPedidod2"
                            :disable="!clienteStore.documento"
                            size="xs"
                          />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-5">
                      <q-input
                        v-model="clienteStore.nombre"
                        label="Nombre"
                        dense
                        outlined
                        lazy-rules
                        :rules="[(val) => !!val || 'Requerido']"
                        style="font-size: 13px"
                      />
                    </div>

                    <div class="col-3">
                      <q-input
                        v-model="clienteStore.direccion"
                        label="Dirección"
                        dense
                        outlined
                        lazy-rules
                        :rules="[(val) => !!val || 'Requerido']"
                        style="font-size: 13px"
                      />
                    </div>

                    <!-- <div class="col-3">
                      <q-input
                        v-model="clienteStore.telefono"
                        label="Teléfono"
                        dense
                        outlined
                        mask="####-####"
                        style="font-size: 13px"
                      />
                    </div> -->
                    <!-- 
                    <div class="col-6">
                      <q-input
                        v-model="clienteStore.email"
                        label="Email"
                        dense
                        outlined
                        type="email"
                        style="font-size: 13px"
                      >
                        <template v-slot:append>
                          <q-btn
                            flat
                            dense
                            icon="cleaning_services"
                            color="yellow-10"
                            @click="limpiarCliente"
                            size="xs"
                          />
                        </template>
                      </q-input>
                    </div> -->
                  </div>
                </q-form>
              </div>
            </q-card>
          </q-expansion-item>
        </div>

        <!-- Validar NIT -->
        <div class="col-auto q-mt-md">
          <q-card flat class="bg-white shadow-3">
            <q-toggle
              v-model="validador"
              label="Validar"
              icon="done"
              size="sm"
              class="boton-amarillo"
              style="min-height: 38px"
            ></q-toggle>
            <q-tooltip> Activa y desactiva el validador de Nit</q-tooltip>
          </q-card>

          <!-- Modal de Pedidos Pendientes Mejorado -->
          <q-dialog v-model="modalPendientes" persistent no-focus-trap>
            <q-card
              class="modal-pedidos-pendientes"
              style="min-width: 1000px; max-width: 1200px; z-index: -1"
            >
              <!-- Header mejorado -->
              <q-card-section class="modal-header">
                <div class="row items-center">
                  <div class="header-icon">
                    <q-icon name="assignment" size="32px" />
                  </div>
                  <div class="header-content">
                    <div class="text-h6 text-weight-bold">
                      Pedidos y Cotizaciones Pendientes
                    </div>
                  </div>
                  <q-space />
                  <q-btn
                    icon="close"
                    flat
                    dense
                    round
                    v-close-popup
                    class="close-btn"
                  />
                </div>
              </q-card-section>

              <!-- Tabs mejorados -->
              <q-tabs
                v-model="tab"
                dense
                class="tabs-mejorados"
                active-color="primary"
                indicator-color="primary"
                align="left"
              >
                <q-tab
                  name="pedidos"
                  :label="`Pedidos (${filteredPedidos.length})`"
                  icon="shopping_cart"
                />
                <q-tab
                  name="cotizaciones"
                  :label="`Cotizaciones (${filteredCotizaciones.length})`"
                  icon="description"
                />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tab" animated class="tab-panels">
                <!-- Panel de Pedidos -->
                <q-tab-panel name="pedidos" class="q-pa-none">
                  <div class="panel-content">
                    <!-- Barra de búsqueda mejorada -->
                    <div class="search-section">
                      <q-input
                        v-model="filtroPedidos"
                        placeholder="Buscar por número, cliente o NIT..."
                        debounce="300"
                        outlined
                        dense
                        class="search-input"
                      >
                        <template v-slot:prepend>
                          <q-icon name="search" color="grey-6" />
                        </template>
                        <template v-slot:append v-if="filtroPedidos">
                          <q-icon
                            name="clear"
                            class="cursor-pointer"
                            @click="filtroPedidos = ''"
                          />
                        </template>
                      </q-input>
                    </div>

                    <!-- Tabla mejorada -->
                    <div class="table-container">
                      <q-markup-table class="tabla-moderna">
                        <thead>
                          <tr>
                            <th class="text-left col-pedido"># Pedido</th>
                            <th class="text-left col-cliente">Cliente</th>
                            <th class="text-left col-nit">NIT</th>
                            <th class="text-right col-total">Total</th>
                            <th class="text-center col-actions">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="pedido in filteredPedidos"
                            :key="pedido.NUMERO_DE_PEDIDO"
                            class="table-row"
                          >
                            <td class="text-left">
                              <div class="pedido-number">
                                <span class="text-weight-bold">{{
                                  pedido.NUMERO_DE_PEDIDO
                                }}</span>
                              </div>
                            </td>
                            <td class="text-left">
                              <div class="cliente-info">
                                <div class="cliente-nombre">
                                  {{ pedido.NOMBRE_A_FACTURAR }}
                                </div>
                              </div>
                            </td>
                            <td class="text-left">
                              <q-chip
                                size="sm"
                                color="grey-3"
                                text-color="grey-8"
                                :label="pedido.NIT_A_FACTURAR"
                              />
                            </td>
                            <td class="text-right">
                              <div class="total-amount">
                                Q. {{ pedido.TOTAL_GENERAL_PEDIDO.toFixed(2) }}
                              </div>
                            </td>
                            <td class="text-center">
                              <div class="action-buttons">
                                <q-btn
                                  icon="play_arrow"
                                  color="positive"
                                  dense
                                  round
                                  size="sm"
                                  @click="continuarPedido(pedido)"
                                >
                                  <q-tooltip>Continuar Pedido</q-tooltip>
                                </q-btn>
                                <q-btn
                                  icon="delete"
                                  color="negative"
                                  dense
                                  round
                                  size="sm"
                                  @click="anularPedido(pedido)"
                                >
                                  <q-tooltip>Anular Pedido</q-tooltip>
                                </q-btn>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>

                      <!-- Estado vacío -->
                      <div
                        v-if="filteredPedidos.length === 0"
                        class="empty-state"
                      >
                        <q-icon
                          name="shopping_cart"
                          size="64px"
                          color="grey-4"
                        />
                        <div class="text-h6 text-grey-6 q-mt-md">
                          No hay pedidos pendientes
                        </div>
                        <div class="text-body2 text-grey-5">
                          {{
                            filtroPedidos
                              ? "No se encontraron resultados para tu búsqueda"
                              : "Todos los pedidos han sido procesados"
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>

                <!-- Panel de Cotizaciones -->
                <q-tab-panel name="cotizaciones" class="q-pa-none">
                  <div class="panel-content">
                    <!-- Barra de búsqueda mejorada -->
                    <div class="search-section">
                      <q-input
                        v-model="filtroCotizaciones"
                        placeholder="Buscar por número, cliente o NIT..."
                        debounce="300"
                        outlined
                        dense
                        class="search-input"
                      >
                        <template v-slot:prepend>
                          <q-icon name="search" color="grey-6" />
                        </template>
                        <template v-slot:append v-if="filtroCotizaciones">
                          <q-icon
                            name="clear"
                            class="cursor-pointer"
                            @click="filtroCotizaciones = ''"
                          />
                        </template>
                      </q-input>
                    </div>

                    <!-- Tabla mejorada -->
                    <div class="table-container">
                      <q-markup-table flat bordered class="tabla-moderna">
                        <thead>
                          <tr>
                            <th class="text-left col-pedido"># Cotización</th>
                            <th class="text-left col-cliente">Cliente</th>
                            <th class="text-left col-nit">NIT</th>
                            <th class="text-right col-total">Total</th>
                            <th class="text-center col-actions">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="pedido in filteredCotizaciones"
                            :key="pedido.NUMERO_DE_PEDIDO"
                            class="table-row"
                          >
                            <td class="text-left">
                              <div class="pedido-number">
                                <q-icon
                                  name="description"
                                  size="sm"
                                  color="green-6"
                                />
                                <span class="text-weight-bold">{{
                                  pedido.NUMERO_DE_PEDIDO
                                }}</span>
                              </div>
                            </td>
                            <td class="text-left">
                              <div class="cliente-info">
                                <div class="cliente-nombre">
                                  {{ pedido.NOMBRE_A_FACTURAR }}
                                </div>
                              </div>
                            </td>
                            <td class="text-left">
                              <q-chip
                                size="sm"
                                color="grey-3"
                                text-color="grey-8"
                                :label="pedido.NIT_A_FACTURAR"
                              />
                            </td>
                            <td class="text-right">
                              <div class="total-amount">
                                Q. {{ pedido.TOTAL_GENERAL_PEDIDO.toFixed(2) }}
                              </div>
                            </td>
                            <td class="text-center">
                              <div class="action-buttons">
                                <q-btn
                                  icon="play_arrow"
                                  color="positive"
                                  flat
                                  dense
                                  round
                                  size="sm"
                                  @click="continuarPedido(pedido)"
                                >
                                  <q-tooltip>Continuar Cotización</q-tooltip>
                                </q-btn>
                                <q-btn
                                  icon="print"
                                  color="primary"
                                  flat
                                  dense
                                  round
                                  size="sm"
                                  @click="imprimirCotizacion(pedido)"
                                >
                                  <q-tooltip>Imprimir Cotización</q-tooltip>
                                </q-btn>
                                <q-btn
                                  icon="close"
                                  color="negative"
                                  flat
                                  dense
                                  round
                                  size="sm"
                                  @click="anularPedido(pedido)"
                                >
                                  <q-tooltip>Anular Cotización</q-tooltip>
                                </q-btn>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </q-markup-table>

                      <!-- Estado vacío -->
                      <div
                        v-if="filteredCotizaciones.length === 0"
                        class="empty-state"
                      >
                        <q-icon name="description" size="64px" color="grey-4" />
                        <div class="text-h6 text-grey-6 q-mt-md">
                          No hay cotizaciones pendientes
                        </div>
                        <div class="text-body2 text-grey-5">
                          {{
                            filtroCotizaciones
                              ? "No se encontraron resultados para tu búsqueda"
                              : "Todas las cotizaciones han sido procesadas"
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>

              <!-- Footer mejorado -->
              <q-card-actions align="right" class="modal-footer">
                <q-btn
                  flat
                  label="Cerrar"
                  color="grey-7"
                  icon="close"
                  v-close-popup
                  class="close-button"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>

        <!-- Boton para modal pedidos/cotizaciones pendientes -->
        <div class="btn-pendientes-container" v-if="userStore.tipoUsuarioStore === 'POS'">
          <q-btn
            icon="assignment"
            class="boton-amarillo"
            @click="abrirModalPedidosPendientes"
          />
          <q-tooltip> Pedidos y Cotizaciones Pendientes</q-tooltip>
        </div>

        <!-- Botones al lado derecho -->
        <div class="col-auto q-ml-sm">
          <q-card flat class="q-pa-sm bg-white shadow-3">
            <div class="row items-center q-gutter-sm no-wrap">
              <!-- Número de Pedido -->
              <div v-if="mostrarNumPedido" class="row items-center q-gutter-xs">
                <div
                  class="text-subtitle2 text-primary"
                  style="font-size: 160%;"
                >
                  {{ estadoPedido === "pedido" ? "Pedido" : "Cotización" }} N°
                  {{ formatNumber(numPedido2) }}
                </div>
              </div>

              <!-- Total de Venta -->
              <div class="row items-center q-gutter-xs q-pa-xs">
                <div
                  class="text-body1 text-amber-10 text-weight-bold"
                  style="font-size: 400%"
                >
                  Total: {{ formatCurrency(totalStore.totalGeneral, 2) }}
                </div>
              </div>
              <!-- Último cambio (vuelto) -->
              <!-- <div class="row items-center q-gutter-xs q-mt-xs q-ml-md">
                <q-icon name="undo" size="sm" class="text-green-7" />
                <div class="text-positive text-weight-bold">
                  Cambio: {{ formatCurrency(totalStore.ultimoCambio, 2) }}
                </div>
              </div> -->
            </div>
          </q-card>
        </div>

        <ModalEditarCliente
          :model-value="abrirModalCliente"
          @update:modelValue="abrirModalCliente = $event"
          :cliente="clienteTemp"
          modo="crear"
          @guardar="guardarClienteDesdeModal"
        />

        <!-- Modal para escanear codigo de rompefilas -->
        <q-dialog v-model="modalCodigoRompefilas">
          <q-card
            style="min-width: 350px; min-height: 200px; border-radius: 10px"
          >
            <q-toolbar class="bg-yellow-8 text-black">
              <q-icon name="qr_code_2" size="sm" class="q-mr-sm" />
              <q-toolbar-title class="text-subtitle1 text-weight-bold"
                >Rompefilas</q-toolbar-title
              >
              <q-btn icon="close" flat round dense v-close-popup />
            </q-toolbar>

            <q-card-section class="q-pt-md">
              <q-input
                dense
                v-model="codigoBarra"
                autofocus
                @keyup.enter="handleAceptarCodigo"
                placeholder="Escanear o ingresar código"
                class="q-mt-sm"
              />
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn label="Cancelar" color="orange" @click="handleCancelar" />
              <q-btn
                label="Aceptar"
                color="orange"
                @click="handleAceptarCodigo"
                :disable="!codigoBarra"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </div>

  <ProductosTab
    ref="productosTabRef"
    :pedidoId="idPedidoEnc"
    :onNuevoPedido="nuevoPedido"
    :tipoPedido="estadoPedido"
    @update-estado="handleActualizarPedido"
  />
  <TablaProductos
    ref="tablaProductosRef"
    :-pedido-id="idPedidoEnc"
    :onProductoEliminado="enfocarInputCodigo"
  />
  <q-footer>
    <div class="bg-yellow-8 text-black q-pa-sm row items-center justify-center">
      <div class="q-pr-md">
        <div class="text-weight-bold">
          Libreria San Bartolome - copy right © {{ new Date().getFullYear() }}
        </div>
      </div>

      <div class="cambio row items-center q-gutter-xs">
        <q-icon name="account_balance_wallet" size="sm" class="" />
        <div
          class="text-balance text-weight-bold bg-black q-pa-sm q-rounded-borders"
        >
          <span class="text-white">Cambio:</span>
          <span class="text-white">
            {{ formatCurrency(totalStore.ultimoCambio, 2) }}
          </span>
        </div>
      </div>
    </div>
  </q-footer>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import {
  ref,
  computed,
  onMounted,
  watchEffect,
  watch,
  onBeforeUnmount,
} from "vue";
import { QExpansionItem, Notify } from "quasar";
import useClientes from "../../clientes/composables/useClientes";
import {
  showConfirmationDialog,
  showErrorNotification,
  showSuccessNotification,
  showConfirmationInsideModal,
  showConfirmationInsideModal2,
  showErrorNotificationInside,
} from "@/common/helper/notification";
import ModalEditarCliente from "@/modals/modalEditarCliente.vue";
import type { Cliente } from "@/modules/clientes/interfaces/clientesInterface";
import usePedidosEnc from "@/modules/pedidos_enc/composables/usePedidosEnc";
import { useUserStore } from "../../../stores/user";
import { nextTick } from "vue";
import ProductosTab from "@/modules/pos/pages/productostab.vue";
import { usePedidoStore } from "@/stores/pedido";
import TablaProductos from "./tablaProductos.vue";
import { useTotalStore } from "@/stores/total";
import { useClienteStore } from "@/stores/cliente";
import { cleanAllStores } from "@/common/helper/cleanStore";
import { useValidation } from "@/modules/validation/composables/useValidation";
import useFormat from "@/common/composables/useFormat";
import { useBodegas } from "@/modules/bodegas/composables/useBodegas";
import { useStoreSucursal } from "@/stores/sucursal";
import { useConfiguracionPos } from "@/modules/configuracion_pos/composables/useConfiguracionPos";
import { runWithLoading } from "@/common/helper/notification";
import { PedidosEnc } from "@/modules/pedidos_enc/interfaces/pedidoEncInterface";
import { usePdfCotizacion } from "@/modules/cotizacion_pdf/composable/useCotizacion";
import type { DataCotizacion } from "@/modules/cotizacion_pdf/interfaces/cotizacion.interface";
import {
  obtenerDetallePedido,
  obtenerPedidoEncPorNumero,
} from "@/modules/pedidos_enc/action/pedidosEncAction";
import { loginRoutes } from "../../login/router/index";

const { ObtenerBodegasId2 } = useBodegas();
const storeSucursal = useStoreSucursal();
const { obtenerConfiguracionPos } = useConfiguracionPos();
const { formatCurrency, formatNumber, formatDecimal } = useFormat();
const validador = ref(true);
const $q = useQuasar();
const tipoDocumento = ref<"nit" | "dpi">("nit");
const clienteStore = useClienteStore();
const totalStore = useTotalStore();
const tablaProductosRef = ref();
const pedidoStore = usePedidoStore();
const userStore = useUserStore();
const abrirModalCliente = ref(false);
const mostrarCardPedidoCreado = ref(false);
const mostrarCardTotal = ref(false);
const expansion = ref<any>(null);
const numPedido = ref(0);
const totalReal = ref(0);
const productosTabRef = ref(null);
const focus = ref(null);
const modalPendientes = ref(false);
const mostrarModalFacturacion = ref(false);
const expansionCliente = ref(false);
const formRef = ref();
const bodega = ref();
const { obtenerClientePorDocumento, refetchMostrarCF, mutateCrearCliente } =
  useClientes();
const {
  mutateCrearPedidoEnc,
  obtenerPedidosPendientes,
  obtenerPedidoPorId,
  mutateAnularPedidoPendiente,
} = usePedidosEnc();
const idPedidoEnc = computed(() => pedidoStore.idPedidoEnc || 0); // Aseguramos que sea un número
const { data: pedidoEnc } = obtenerPedidoPorId(idPedidoEnc);
const mostrarNumPedido = computed(() => pedidoStore.numeroDePedido || 0);
const numPedido2 = computed(() => pedidoStore.numeroDePedido || 0); // pedido funcional
const focus2 = ref<HTMLInputElement | null>(null);
let espera: ReturnType<typeof setTimeout> | null = null; // Para la busqueda automatica
const estadoPedido = ref(
  !pedidoStore.estadoPedido || pedidoStore.estadoPedido === "P"
    ? "pedido"
    : "cotización"
);
const tab = ref("pedidos");
const { generarCotizacionPDF } = usePdfCotizacion();
const filtroPedidos = ref("");
const filtroCotizaciones = ref("");
const modalCodigoRompefilas = ref(false);
const codigoBarra = ref("");

// abrir expansion item y focus a nit
watch(
  () => clienteStore.documento,
  async (nuevo) => {
    if (!nuevo || nuevo.trim() === "" || nuevo === "0") {
      await nextTick();
      expansion.value?.show();

      await formRef.value?.resetValidation();

      await nextTick();
      focus.value?.focus();
    }
  },
  { immediate: true }
);

watch(abrirModalCliente, async (isOpen, wasOpen) => {
  // Cuando pase de abierto -> cerrado
  if (wasOpen && !isOpen) {
    // Validamos que el store tenga datos mínimos
    const nit = (clienteStore.documento || "").trim();
    const nombre = (clienteStore.nombre || "").trim();
    const direccion = (clienteStore.direccion || "").trim();

    if (!nit || !nombre || !direccion) return;

    // Crear pedido automáticamente al cerrar el modal
    await nextTick();
    // crearPedido();
  }
});

//crear pedido
const crearPedidod2 = () => {
  crearPedido();
};

// Limpiar informaicon del form
const limpiarCliente = async () => {
  clienteStore.limpiarCliente();
  resetCliente();
};

// si dpi o nit cambia, limpiar el store
watch(tipoDocumento, async (nuevo) => {
  enfocarCodigo();
  clienteStore.limpiarCliente();
});

// controla que exista un pedido
watch(idPedidoEnc, (nuevoId) => {
  if (nuevoId && nuevoId > 0) {
    // console.log("Pedido actualizado desde query:", {
    //   total: totalReal.value,
    // });
  }
});

watch(estadoPedido, (newEstado) => {
  if (newEstado) {
    focus.value.focus();
  }
});

//busqueda automatica
const busquedaAutomatica = () => {
  if (espera) clearTimeout(espera); // Limpiar tiempo

  if (clienteStore.documento.length > 1) {
    espera = setTimeout(() => {
      buscarClienteDPINIT2();
      (clienteStore.nombre = ""), (clienteStore.direccion = "");
      clienteTemp.value.NOMBRE = "";
    }, 700);
  } else if (clienteStore.documento.length === 0) {
    clienteStore.limpiarCliente();
  }
};

// Funcion para manejar el estado del pedido
const handleActualizarPedido = (nuevoEstado: string) => {
  estadoPedido.value = nuevoEstado;
};

// Anular pedido pendiente
const anularPedido = async (pedido: PedidosEnc) => {
  const tipoPedido = pedido.ESTADO_PEDIDO === "P" ? "pedido" : "cotización";

  modalPendientes.value = false;

  await nextTick();

  const confirmado = await showConfirmationInsideModal(
    `Anular ${tipoPedido}`,
    `¿Está seguro que desea anular ${
      tipoPedido === "pedido" ? "el" : "la"
    } ${tipoPedido}?`
  );

  if (!confirmado) {
    modalPendientes.value = true;
    return;
  }

  mutateAnularPedidoPendiente({
    id: pedido.ID_PEDIDO_ENC,
    usuario: userStore.nombreVendedor,
  });

  // Limpiar Pedido
  cleanAllStores();
  estadoPedido.value = "pedido";
};

// continuar pedido pendiente
const continuarPedido = async (pedido) => {
  const tipoPedido = pedido.ESTADO_PEDIDO === "P" ? "pedido" : "cotización";

  modalPendientes.value = false;

  await nextTick();

  await formRef.value?.resetValidation();
  // Enfocar productosTab para continuar
  await productosTabRef.value?.enfocarCodigo();

  // Actualizar el store con el ID del pedido pendiente
  pedidoStore.setPedidoEncabezado(
    pedido.ID_PEDIDO_ENC,
    pedido.NUMERO_DE_PEDIDO,
    pedido.CODIGO_VENDEDOR,
    pedido.ESTADO_PEDIDO
  );

  // set cliente
  clienteStore.setCliente({
    idCliente: pedido.CODIGO_DE_CLIENTE,
    documento: pedido.NIT_A_FACTURAR,
    nombre: pedido.NOMBRE_A_FACTURAR,
    direccion: pedido.DIRECCION_FACTURAR,
    telefono: pedido.TELEFONO_CLIENTE || null, // no viene la info
    email: pedido.EMAIL_CLIENTE || null, // no viene la info
  });

  estadoPedido.value = tipoPedido;

  // Cerrar modal de pendientes
  modalPendientes.value = false;

  // Enfocar productosTab para continuar
  await productosTabRef.value?.enfocarCodigo();
};

const truncateDosDecimales = (numero) => {
  return Math.trunc(numero * 100) / 100;
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Preparar actualizacion para pedido
const prepararDataCotizacion = async (
  pedido: PedidosEnc
): Promise<DataCotizacion> => {
  const apiResponseDetallePedido = await obtenerDetallePedido(
    pedido.ID_PEDIDO_ENC
  );

  const items = apiResponseDetallePedido.map((item: any) => {
    return {
      cantidad: item.CANTIDAD_PEDIDA,
      descripcion: item.DESCRIPCION_PROD,
      precio: formatCurrency(item.PRECIO_UNIDAD_VENTA, 2),
      subtotal: formatCurrency(item.SUBTOTAL_VENTAS + item.MONTO_IVA, 2),
    };
  });

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + parseFloat(item.subtotal.replace("Q.", "")),
    0
  );

  const dataCotizacion: DataCotizacion = {
    encabezado: {
      numeroInterno: `${pedido.NUMERO_DE_PEDIDO}`,
      tipoDocumento: "COTIZACION",
      fechaEmision: formatearFecha(pedido.FECHA_PEDIDO),
    },

    observacion: pedido.OBSERVACIONES,

    cliente: {
      nombre: pedido.NOMBRE_A_FACTURAR,
      nit: String(pedido.NIT_A_FACTURAR ?? "CF"),
      direccion: pedido.DIRECCION_FACTURAR,
    },

    items,

    resumen: {
      subtotal: formatCurrency(subtotal, 2),
      totalPagar: `Q.${truncateDosDecimales(
        pedido.TOTAL_GENERAL_PEDIDO
      ).toFixed(2)}`,
      totalItems,
    },
    nombreVendedor: pedido.USUARIO_INGRESO_PEDI,
  };

  return dataCotizacion;
};

// Imprimir cotizacion
const imprimirCotizacion = async (pedido) => {
  if (!pedido.TOTAL_GENERAL_PEDIDO) {
    $q.notify({
      type: "warning",
      message: "Agregue un producto antes de imprimir la cotización.",
      position: "top",
      timeout: 3000,
    });
    return;
  }

  try {
    $q.loading.show({
      message: "Imprimiendo cotización",
      boxClass: "bg-grey-2 text-grey-9",
      spinnerColor: "primary",
    });

    const datosCotizacion = await prepararDataCotizacion(pedido);

    const success = await generarCotizacionPDF(datosCotizacion);

    if (success) {
      //console.log("Cotización generada con éxito.")
    } else {
      //console.log("Fallo al genera cotización.")
    }

    $q.loading.hide();
  } catch (error) {
  } finally {
    $q.loading.hide();
  }
};

// Crear Pedido con F3
onMounted(() => {
  window.addEventListener("keydown", crearPedidoConF3);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", crearPedidoConF3);
});

const crearPedidoConF3 = (e: KeyboardEvent) => {
  if (e.key === "F3") {
    e.preventDefault();
    crearPedido();
  }
};

// // Cerrar expansion cuando se crea un pedido
// watchEffect(() => {
//   const cerrar = pedidoStore.idPedidoEnc;

//   if (cerrar > 0) {
//     expansion.value?.hide();
//   }
// });

// Opción A: Solo enfoca cuando el valor queda vacío
watch(
  () => clienteStore.documento,
  (nuevoValor, oldValor) => {
    if (!nuevoValor) {
      expansionCliente.value = true;
      expansion.value?.show();
      enfocarCodigo();
    }
  }
);

// focus al ref
const enfocarCodigo = () => {
  // focus al input NIT/DPI
  focus.value?.focus();
  // refuerzo contra re-enfoque posterior
  setTimeout(() => focus.value?.focus(), 120);
  setTimeout(() => focus.value?.focus(), 300);
};

// Función para enfocar el input de código en ProductosTab
const enfocarInputCodigo = async () => {
  // Pequeño delay para asegurar que la tabla se haya actualizado
  await nextTick();
  // console.log("Enfocando input de código después de eliminar producto");
  productosTabRef.value?.enfocarCodigo();
};

onMounted(() => {
  enfocarCodigo();
});

// Actualizar numPedido y Total
watchEffect(() => {
  if (pedidoEnc.value) {
    numPedido.value = pedidoEnc.value.NUMERO_DE_PEDIDO || 0;
    totalReal.value = pedidoEnc.value.TOTAL_GENERAL_PEDIDO || 0;
  }
});

const {
  data: pedidosPendientes,
  isLoading,
  refetch: refetchPedidosPendientes,
} = obtenerPedidosPendientes(
  Number(storeSucursal.idSucursal), // Convertido a numero
  userStore.codigoVendedor
);

// Propiedad computada para filtrar la lista de pedidos
const filteredPedidos = computed(() => {
  if (!pedidosPendientes.value) {
    return [];
  }
  const searchTerm = filtroPedidos.value.toLowerCase();

  return pedidosPendientes.value.filter((p) => {
    const isPending = p.ESTADO_PEDIDO === "P";
    const matchesSearch =
      String(p.NUMERO_DE_PEDIDO).toLowerCase().includes(searchTerm) ||
      p.NOMBRE_A_FACTURAR.toLowerCase().includes(searchTerm) ||
      p.NIT_A_FACTURAR.toLowerCase().includes(searchTerm);

    return isPending && matchesSearch;
  });
});

// Propiedad computada para filtrar la lista de cotizaciones
const filteredCotizaciones = computed(() => {
  if (!pedidosPendientes.value) {
    return [];
  }
  const searchTerm = filtroCotizaciones.value.toLowerCase();

  return pedidosPendientes.value.filter((p) => {
    const isQuote = p.ESTADO_PEDIDO === "C";
    const matchesSearch =
      String(p.NUMERO_DE_PEDIDO).toLowerCase().includes(searchTerm) ||
      p.NOMBRE_A_FACTURAR.toLowerCase().includes(searchTerm) ||
      p.NIT_A_FACTURAR.toLowerCase().includes(searchTerm);

    return isQuote && matchesSearch;
  });
});

const abrirModalPedidosPendientes = () => {
  refetchPedidosPendientes();
  modalPendientes.value = true;
};

//Llenar modal desde esta pagina
const clienteTemp = ref({
  idCliente: undefined,
  NIT: "",
  DPI: "",
  NOMBRE: "",
  DIRECCION: "",
  TELEFONO: "",
  CORREO_ELECTRONICO: "",
});

//Limpiar los datos del cliente
const resetCliente = () => {
  clienteTemp.value = {
    idCliente: undefined,
    NIT: "",
    DPI: "",
    NOMBRE: "",
    DIRECCION: "",
    TELEFONO: "",
    CORREO_ELECTRONICO: "",
  };
};

const nuevoPedido = () => {
  resetCliente();
};

// crear pedido xd
const crearPedido = async () => {
  if (pedidoStore.idPedidoEnc) {
    showErrorNotification(
      "Error",
      "Ya existe un pedido pendiente, por favor anule o factura el pedido pendiente antes de crear uno nuevo"
    );
    return;
  }

  // Se debe validar bien que no exista
  // if(validador.value === true){
  //   showErrorNotification('Validar Cliente', 'Debe validar al cliente con DPI o NIT')
  //   return
  // }

  const nombre = clienteStore.nombre?.trim();
  const direccion = clienteStore.direccion?.trim();
  const nit = clienteStore.documento?.trim();
  const codigo = clienteStore.idCliente;

  if (!nombre || !direccion || !nit) {
    showErrorNotification(
      "Datos incompletos",
      "Debe seleccionar un cliente válido antes de crear el pedido"
    );
    return;
  }
  if (!codigo || codigo === "0") {
    $q.notify({
      type: "negative",
      message:
        "No se puede crear el pedido, debe seleccionar un cliente válido",
      position: "top",
      timeout: 2000,
    });

    // clienteStore.limpiarCliente();
    return;
  }

  const pedidoEnc = {
    NOMBRE_A_FACTURAR: nombre,
    DIRECCION_FACTURAR: direccion,
    NIT_A_FACTURAR: nit,
    SUBTOTAL_PEDIDO: 0,
    TOTAL_GENERAL_PEDIDO: 0,
    ID_SUCURSAL: Number(storeSucursal.idSucursal),
    USUARIO_INGRESO_PEDI: userStore.nombreVendedor.substring(0, 10),
    CODIGO_VENDEDOR: userStore.codigoVendedor,
    CODIGO_DE_CLIENTE:
      nit === "CF"
        ? obtenerConfiguracionPos.value.CODIGO_CLIENTE_CF
        : Number(clienteStore.idCliente),
    ESTADO_PEDIDO: estadoPedido.value === "pedido" ? "P" : "C",
  };

  mutateCrearPedidoEnc(pedidoEnc, {
    onSuccess: async (data) => {
      // Actualizar variables reactivas
      numPedido.value = data.NUMERO_DE_PEDIDO;
      totalReal.value = data.TOTAL_GENERAL_PEDIDO;
      totalStore.setTotal(data.TOTAL_GENERAL_PEDIDO);

      //store pedido
      pedidoStore.setPedidoEncabezado(
        data.ID_PEDIDO_ENC,
        data.NUMERO_DE_PEDIDO,
        data.CODIGO_VENDEDOR,
        data.ESTADO_PEDIDO
      );

      mostrarCardPedidoCreado.value = true;
      mostrarCardTotal.value = true;

      // Notificaccion de creado
      $q.notify({
        type: "success",
        message: `${estadoPedido.value} N° ${data.NUMERO_DE_PEDIDO} creado con éxito`,
        position: "top",
        color: "green",
        timeout: 2000,
        group: false, // se muestra de inmediato
        progress: true,
      });

      await nextTick();
      //focus en input codigo de barra de productos
      productosTabRef.value?.enfocarCodigo();

      expansion.value?.hide();
    },
    onError: (error: any) => {
      // NO cerrar el expansion cuando hay error - debe permanecer abierto para que el usuario pueda corregir
      $q.notify({
        type: "negative",
        message:
          `No se pudo crear el pedido ${
            estadoPedido.value === "pedido" ? "el" : "la"
          } ${estadoPedido.value}` +
          " | " +
          error.message,
      });
    },
  });
};

// Funcion para Colocar CF
const colocarCF = async () => {
  const cf = await refetchMostrarCF();

  if (cf.data) {
    clienteStore.setCliente({
      idCliente: cf.data.ID_ACLIENTE,
      documento: cf.data.NIT || "",
      nombre: cf.data.NOMBRE || "",
      direccion: cf.data.DIRECCION || "",
      telefono: cf.data.TELEFONO || "",
      email: cf.data.CORREO_ELECTRONICO || "",
    });
    crearPedido();
  }
};

// Datos para el validador
const nit = ref("");
const tipo2 = ref("nit");
// Validador
const empresa = ref("GS");

const { data, DatosSat2 } = useValidation(
  nit.value,
  tipoDocumento.value,
  validador.value,
  empresa.value
);

// Funcion de busqueda de cliente
const buscarClienteDPINIT2 = async () => {
  try {
    // Valor que se ingresa es doc
    const doc = (clienteStore.documento || "").trim();
    if (!doc) return;

    // asignar el nit a doc
    nit.value = doc;

    // 1)  BD local
    const tipo = tipoDocumento.value;
    const clienteBD = await obtenerClientePorDocumento(doc, tipo);

    if (clienteBD) {
      clienteStore.setCliente({
        idCliente: clienteBD.ID_ACLIENTE,
        documento:
          tipoDocumento.value === "nit" ? clienteBD.NIT : clienteBD.DPI, // si se busca por dpi o nit
        nombre: clienteBD.NOMBRE || "",
        direccion: clienteBD.DIRECCION || "",
        telefono: clienteBD.TELEFONO || "",
        email: clienteBD.CORREO_ELECTRONICO || "",
      });

      return;
    }

    // 2) SEGUNDO: SAT (si el validador está activo)
    if (validador.value) {
      $q.loading.show({
        message: "Consultando datos en SAT…",
        spinnerColor: "green",
        spinnerSize: 50,
      });

      const result = await DatosSat2(
        nit.value,
        tipoDocumento.value,
        validador.value,
        empresa.value
      );

      $q.loading.hide();

      const nombreSat = result.data.nombre; // Guardar el nombre retornado de sat

      // result = texto
      if (result.isCertified === false) {
        // showErrorNotification(
        //   "Error",
        //   result.data.nombre + " no es certificado"
        // );
        clienteStore.setCliente({
          idCliente: 0,
          documento: tipoDocumento.value === "nit" ? doc : doc, // si se busca por dpi o nit
          nombre: result.data.nombre,
          direccion: "No direcion",
          telefono: "",
          email: "",
        });

        return;
      } else {
        // 3) No existe en BD pero SAT devolvió nombre -> abrir modal con datos prellenados
        abrirModalCliente.value = true;
        (clienteTemp.value.NIT = tipoDocumento.value === "nit" ? doc : ""),
          (clienteTemp.value.DPI = tipoDocumento.value === "dpi" ? doc : ""),
          (clienteTemp.value.NOMBRE = nombreSat);
        clienteTemp.value.DIRECCION = "Ciudad";

        nextTick(async () => {
          //await crearPedido() // Nuevo crear pedido - no lo esta creando miau miau miau
        });
        // Crear el pedido ahora

        const cliente2 = await obtenerClientePorDocumento(doc, tipo);
        //aqui guardar el id

        //clienteStore.idCliente =
        clienteStore.setCliente({
          idCliente: Number(clienteStore.idCliente) || undefined, //  conservar si existía
          documento: clienteTemp.value.NIT || clienteTemp.value.DPI,
          nombre: clienteTemp.value.NOMBRE,
          direccion: clienteTemp.value.DIRECCION,
          telefono: clienteTemp.value.TELEFONO || "",
          email: clienteTemp.value.CORREO_ELECTRONICO || "",
        });
      }
    }

    // 4) Si no hay en BD y SAT no devolvió nombre -> abrir modal solo con NIT o DPI
    if (tipoDocumento.value === "nit") {
      clienteTemp.value.NIT = doc;
    } else if (tipoDocumento.value === "dpi") {
      clienteTemp.value.DPI = doc;
    }

    //clienteTemp.value.NIT = doc;
    //clienteTemp.value.DIRECCION = "Ciudad";
    abrirModalCliente.value = true;
  } catch (err) {
    abrirModalCliente.value = true;
    $q.notify({
      type: "negative",
      message: "Error al validar el documento del clientes",
      caption: err.message || "No se pudo validar el documento",
      position: "top",
      color: "red",
      icon: "error",
      timeout: 2000,
    });
    $q.loading.hide();
    focus.value?.focus();
    focus.value?.select();
  }
};

// Deshabilitada ---------------------------------
const buscarClienteDPINIT = async () => {
  const doc = clienteStore.documento.trim();
  if (!doc) return;

  const tipo: "dpi" | "nit" = doc.length > 9 ? "dpi" : "nit";

  // Buscar cliente
  const clienteEncontrado = await obtenerClientePorDocumento(doc, tipo);

  if (clienteEncontrado) {
    clienteStore.setCliente({
      idCliente: clienteEncontrado.ID_ACLIENTE,
      documento: clienteEncontrado.NIT || "",
      nombre: clienteEncontrado.NOMBRE || "",
      direccion: clienteEncontrado.DIRECCION || "",
      telefono: clienteEncontrado.TELEFONO || "",
      email: clienteEncontrado.CORREO_ELECTRONICO || "",
    });

    // NO cerrar expansion aquí - se cerrará en onSuccess de crearPedido
    crearPedido();
  } else {
    abrirModalCliente.value = true;
    clienteTemp.value.NIT = doc; // prellenar el NIT buscado
  }
};

// Pues usar F2 que mas la funcion lo dice
const usarF2 = (e: KeyboardEvent) => {
  if (e.key === "F2") {
    e.preventDefault();
    colocarCF();
  }
};

const guardarClienteDesdeModal = (nuevoCliente: Cliente) => {
  const payload: Partial<Cliente> = { ...nuevoCliente };

  // Campos adicionales
  if (!payload.CORREO_ELECTRONICO || payload.CORREO_ELECTRONICO.trim() === "") {
    delete payload.CORREO_ELECTRONICO;
  }

  // TELEFONO: debe ser string,
  if (!payload.TELEFONO || typeof payload.TELEFONO !== "string") {
    payload.TELEFONO = "";
  }

  mutateCrearCliente(payload, {
    onSuccess: (creado: Cliente) => {
      clienteStore.setCliente({
        // idCliente no existe
        idCliente: creado.ID_ACLIENTE,
        documento: creado.DPI || creado.NIT || "",
        nombre: creado.NOMBRE,
        direccion: creado.DIRECCION,
        telefono: creado.TELEFONO || "",
        email: creado.CORREO_ELECTRONICO || "",
      });

      abrirModalCliente.value = false;
      // NO cerrar expansion aquí - se cerrará en onSuccess de crearPedido

      $q.notify({
        type: "success",
        message: "Cliente creado satisfactoriamente",
        position: "top",
        color: "green",
        timeout: 2000,
      });

      // Crear pedido
      crearPedido();
    },
    onError: (error: any) => {
      showErrorNotification(
        "Error",
        error.message || "No se pudo registrar el cliente"
      );
    },
  });
};

// Crear Pedido con F9
onMounted(() => {
  window.addEventListener("keydown", handleModalCodigo);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleModalCodigo);
});

// Modal para escanear codigo generado en rompefilas
const handleModalCodigo = (event: KeyboardEvent) => {
  if (event.key === "F9" && userStore.tipoUsuarioStore === "POS") {
    if (numPedido2.value > 0) {
      $q.notify({
        type: "negative",
        message: `Limpie, anule o termine el pedido actual para cargar rompefilas.`,
        position: "top",
        timeout: 2000,
      });
      return;
    }
    event.preventDefault();
    modalCodigoRompefilas.value = true;
  }
};

const handleAceptarCodigo = async () => {
  if (!codigoBarra.value) return;

  try {
    $q.loading.show({
      message: "Buscando pedido",
      boxClass: "bg-grey-2 text-grey-9",
      spinnerColor: "primary",
    });

    //console.log('Código de barras ingresado:', codigoBarra.value);
    const pedidoEnc = await obtenerPedidoEncPorNumero(
      parseInt(codigoBarra.value)
    );

    if (!pedidoEnc) {
      $q.notify({
        type: "negative",
        message: `Pedido con numero ${codigoBarra.value} no encontrado.`,
        position: "top",
        color: "green",
        timeout: 2000,
      });
      return;
    }

    await continuarPedido(pedidoEnc);

    modalCodigoRompefilas.value = false;
    codigoBarra.value = "";
  } catch (error) {
    $q.notify({
      type: "negative",
      message: `Pedido con numero ${codigoBarra.value} no encontrado.`,
      position: "top",
      timeout: 2000,
    });
  } finally {
    $q.loading.hide();
  }
};

// Función para manejar el clic en el botón "Cancelar"
const handleCancelar = () => {
  modalCodigoRompefilas.value = false;
  codigoBarra.value = "";
};
</script>

<style scoped>
.total-card {
  background-color: #fcf5d6;
  border: 1px solid #fae4a2;
  border-radius: 6px;
  min-width: 130px;
  max-height: 50px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

#Diseño de la tabla .tabla-elegante {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 14px;
  background-color: #ffffff;
}

/* Encabezado de la tabla */
.tabla-elegante thead {
  background-color: #fff9db;
  color: #0f0d05;
  font-weight: bold;
  text-transform: uppercase;
}

/* Celdas del encabezado */
.tabla-elegante thead th {
  padding: 12px;
  border-bottom: 2px solid #e0e0e0;
}

/* Celdas del cuerpo */
.tabla-elegante tbody td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

/* Fila hover */
.tabla-elegante tbody tr:hover {
  background-color: #f5faff;
  transition: background-color 0.3s ease;
}

/* Filas alternas */
.tabla-elegante tbody tr:nth-child(odd) {
  background-color: #fafafa;
}

/* Última fila sin borde inferior */
.tabla-elegante tbody tr:last-child td {
  border-bottom: none;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cambio {
  position: absolute;
  right: 0;
  font-size: 32px;
  margin-right: 60px;
  font-weight: 800;
}

.tipo-transaccion-container {
  padding: 8px;
  border-radius: 4px;
}

.tipo-transaccion-toggle {
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}

.btn-pendientes-container {
  margin: 16px 0px 0px 8px;
}

.btn-pendientes {
  padding: 8px 15px;
  border-radius: 10px;
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

/* ===== ESTILOS PARA MODAL DE PEDIDOS PENDIENTES MEJORADO ===== */

.modal-pedidos-pendientes {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #070606;
}

.header-icon {
  background: rgba(7, 6, 6, 0.1);
  border-radius: 12px;
  margin-right: 16px;
}

.header-content {
  flex: 1;
}

.header-content .text-h6 {
  margin-bottom: 4px;
}

.close-btn {
  color: #070606 !important;
  background: rgba(7, 6, 6, 0.1);
  border-radius: 8px;
  padding: 6px;
}

.close-btn:hover {
  background: rgba(7, 6, 6, 0.2);
}

.tabs-mejorados {
  background: linear-gradient(135deg, #fcf5d6 0%, #fae4a2 100%);
  padding: 0 10px;
  border-bottom: 1px solid #fae4a2;
}

.tabs-mejorados .q-tab {
  font-weight: 600;
  border-radius: 8px 8px 0 0;
  margin-right: 8px;
}

.tabs-mejorados .q-tab--active {
  background: white;
  color: #fbc02d;
}

.tab-panels {
  background: white;
}

.panel-content {
  padding: 5px;
}

.search-section {
  margin-bottom: 10px;
}

.search-input {
  max-width: 400px;
}

.table-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tabla-moderna {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: white;
}

.tabla-moderna thead {
  background: linear-gradient(135deg, #fff9db 0%, #fae4a2 100%);
}

.tabla-moderna thead th {
  font-weight: 700;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tabla-moderna tbody td {
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: linear-gradient(135deg, #fcf5d6 0%, #fae4a2 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(251, 192, 45, 0.2);
}

.pedido-number {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cliente-info {
  max-width: 200px;
}

.cliente-nombre {
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  word-break: break-word;
}

.total-amount {
  font-weight: 700;
  color: #fbc02d;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

.action-buttons .q-btn {
  transition: all 0.2s ease;
}

.action-buttons .q-btn:hover {
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 60px 10px;
  background: #fafbfc;
  border-radius: 12px;
  margin: 20px 0;
}

.modal-footer {
  background: linear-gradient(135deg, #fcf5d6 0%, #fae4a2 100%);
  padding: 16px 24px;
  border-top: 1px solid #fae4a2;
}

.close-button {
  padding: 8px 10px;
  border-radius: 8px;
  font-weight: 600;
}

.close-button:hover {
  background: rgba(251, 192, 45, 0.2);
}

/* Columnas específicas */
.col-pedido {
  width: 120px;
}

.col-cliente {
  width: 250px;
}

.col-nit {
  width: 140px;
}

.col-total {
  width: 120px;
}

.col-actions {
  width: 140px;
}

/* Responsive */
@media (max-width: 1024px) {
  .modal-pedidos-pendientes {
    min-width: 95vw !important;
    max-width: 95vw !important;
  }

  .panel-content {
    padding: 10px;
  }

  .tabla-moderna {
    font-size: 13px;
  }

  .tabla-moderna thead th,
  .tabla-moderna tbody td {
    padding: 5px 4px;
  }

  .cliente-info {
    max-width: 150px;
  }
}
</style>
