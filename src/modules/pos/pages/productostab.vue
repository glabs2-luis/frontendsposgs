<template>
  <div class="pedido-detalle-container">
    <q-card
      flat
      bordered
      class="q-pa-md q-mb-xs bg-yellow-1 text-black rounded-borders shadow-2"
    >
      <!-- Detalle del pedido -->
      <div class="row items-center justify-between q-mb-md">
        <!-- Título -->
        <div class="col-auto row items-center q-gutter-sm">
          <q-icon name="receipt_long" size="24px" color="black" />
          <div>
            <div class="text-subtitle2 text-weight-bold text-dark">
              Detalle del Pedido
            </div>
            <div class="text-caption text-grey-8">
              Registra productos escaneando o ingresando manualmente
            </div>
          </div>
        </div>

        <!-- Botones alineados a la derecha -->
        <div class="col-auto row items-center q-gutter-sm">
          <q-toggle
            v-model="contingencia"
            label="Contingencia"
            color="yellow-10"
            keep-color
            class="toggle-brillante"
            @click="confirmarContingencia"
          />
          <q-btn
            v-if="tipoPedido === 'cotización'"
            icon="print"
            color="indigo"
            class="color: black"
            @click="imprimirCotizacion"
            :disable="tipoPedido === 'pedido'"
          />
          <q-btn
            icon="restart_alt"
            color="amber-9"
            class="color: black"
            @click="limpiarPedido"
          />
          <q-btn
            label="Anular"
            color="red-5"
            text-color="black"
            style="color: black"
            @click="limpiar"
          />

          <q-btn
            label="Terminar Venta (F4)"
            icon="point_of_sale"
            @click="terminarVenta"
            class="boton-amarillo"
          />
        </div>
      </div>

      <!-- Segunda fila: inputs + botones -->
      <div class="row q-col-gutter-sm items-end">
        <!-- Código del producto -->
        <q-input
          ref="inputCodigo"
          v-model="codigoProducto"
          label="Código del Producto"
          outlined
          dense
          @keyup.enter="buscarProductoEscaneado"
          class="col-12 col-md-5"
          :disable="errorAgregarProducto"
        >
          <template #append>
            <q-icon name="search" color="primary" />
          </template>
          <template #prepend>
            <q-btn round dense flat icon="view_headline" color="primary" @click="abrirCatalogo2" />
          </template>
        </q-input>

        <!-- Cantidad -->
        <q-input
          v-model.number="cantidad2"
          label="Cantidad"
          type="number"
          outlined
          dense
          min="1"
          class="col-6 col-md-2"
        />

        <!-- Botones -->
        <div class="col-6 col-md-5 row q-gutter-sm">
          <q-btn
            @click="buscarProductoEscaneado"
            class="boton-amarillo"
            icon="add"
            label="Agregar"
            :loading="loadingAgregar"
            :disable="!codigoProducto"
          />
          <q-btn
            @click="abrirCatalogo2"
            color="secondary"
            icon="inventory_2"
            label="Catálogo"
            class="col"
            outline
          />

          <div class="col-auto">
            <div
              class="text-subtitle2 text-black"
              style="
                background-color: #f2f28a;
                font-size: 180%;
                border-radius: 4px;
                color: #000;
                padding: 4px 4px;
                margin-top: px;
              "
            >
              {{ `Productos: ${totalStore.totalItems}` }}
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- Modal de catálogo de productos -->
    <q-dialog v-model="modalProductos2" maximized>
      <q-card class="catalogo-modal">
        <!-- Header mejorado -->
        <q-card-section class="catalogo-header q-pa-lg">
          <div class="row items-center justify-between">
            <div class="col">
              <div class="text-h4 text-weight-bold q-mb-xs">
                <q-icon name="inventory_2" class="q-mr-md" />
                Catálogo de Productos
              </div>
              <div class="text-subtitle1 text-white-7">
                Selecciona productos para agregar a tu pedido
              </div>
            </div>
            <div class="col-auto">
              <q-btn icon="close" flat round dense v-close-popup size="lg" />
            </div>
          </div>
        </q-card-section>

        <!-- Buscador mejorado -->
        <q-card-section class="q-pa-sm q-pb-md">
          <div class="search-container">
            <q-input
              ref="buscadorProductoRef"
              v-model="filtroProductos"
              label="Buscar productos por código, nombre o marca..."
              outlined
              dense
              class="search-input-enhanced"
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template #append>
                <q-btn
                  v-if="filtroProductos"
                  @click="limpiarFiltro"
                  icon="clear"
                  flat
                  round
                  dense
                  color="grey-6"
                />
              </template>
            </q-input>

            <!-- Estadísticas -->
            <div class="row items-center justify-between q-mt-md">
              <div class="text-caption text-grey-6">
                {{ productosFiltrados2.length }} productos encontrados
              </div>
              <q-chip text-color="back" icon="info" size="sm">
                Presiona Enter en cantidad para agregar
              </q-chip>
            </div>
          </div>
        </q-card-section>

        <!-- Tabla de productos mejorada -->
        <q-card-section class="q-pa-sm q-pt-none">
          <div v-if="loadingProductos" class="text-center q-pa-xl">
            <q-spinner-dots color="primary" size="50px" />
            <div class="text-grey-6 q-mt-md">Cargando productos...</div>
          </div>

          <div v-else>
            <q-table
              :rows="productosFiltrados2"
              :columns="columnasCatalogo"
              row-key="PRODUCT0"
              :pagination="paginacionCatalogo"
              :loading="loadingProductos"
              class="catalogo-table"
              flat
              bordered
              separator="cell"
              :rows-per-page-options="[10, 20, 50, 100]"
              :wrap-cells="true"
            >
              <!-- Columna personalizada para código -->
              <template #body-cell-codigo="props">
                <q-td :props="props" class="codigo-cell">
                  <div class="row items-center q-gutter-sm">
                    <q-icon name="qr_code" size="sm" />
                    <div>
                      <div class="text-weight-bold">
                        {{ props.row.PRODUCT0 }}
                      </div>
                      <div class="text-caption text-grey-6">
                        {{ props.row.DESCRIPCION_MARCA }}
                      </div>
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Columna personalizada para descripción -->
              <template #body-cell-descripcion="props">
                <q-td :props="props" class="descripcion-cell">
                  <div class="text-weight-medium">
                    {{ props.row.DESCRIPCION_PROD }}
                  </div>
                </q-td>
              </template>

              <!-- Columna personalizada para precio -->
              <template #body-cell-precio="props">
                <q-td :props="props" class="precio-cell">
                  <div
                    v-if="
                      new Date() >= new Date(props.row.FECHA_VIGENCIA_I) &&
                      new Date() <= new Date(props.row.FECHA_VIGENCIA_F)
                    "
                    class="precio-oferta-table"
                  >
                    <div class="precio-anterior-table">
                      {{ formatCurrency(props.row.PRECIO_SUGERIDO, 3) }}
                    </div>
                    <div class="precio-actual-table">
                      {{ formatCurrency(props.row.PRECIO_PROMOCION, 3) }}
                    </div>
                    <q-chip
                      size="xs"
                      color="green"
                      text-color="white"
                      class="oferta-chip"
                    >
                      ¡OFERTA!
                    </q-chip>
                    <q-chip size="sm" color="orange" class="vigencia-chip">
                      Válido hasta:
                      {{ props.row.FECHA_VIGENCIA_F.slice(0, 10) }}
                    </q-chip>
                  </div>
                  <div v-else class="precio-normal-table">
                    <div class="text-weight-bold text-black">
                      {{ formatCurrency(props.row.PRECIO_SUGERIDO, 3) }}
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Columna personalizada para niveles -->
              <template #body-cell-niveles="props">
                <q-td :props="props" class="niveles-cell">
                  <div
                    v-if="props.row.niveles && props.row.niveles.length > 0"
                    class="niveles-container"
                  >
                    <div
                      v-for="(nivel, nivelIndex) in props.row.niveles"
                      :key="nivelIndex"
                      class="nivel-row"
                    >
                      <q-chip
                        dense
                        size="sm"
                        text-color="grey-8"
                        class="nivel-chip"
                      >
                        {{ nivel }}
                      </q-chip>
                    </div>
                  </div>
                  <div v-else class="text-grey-5 text-caption">Sin niveles</div>
                </q-td>
              </template>

              <!-- Columna personalizada para cantidad -->
              <template #body-cell-cantidad="props">
                <q-td :props="props" class="cantidad-cell">
                  <q-input
                    v-model="props.row.CANTIDAD_PEDIDA"
                    dense
                    min="1"
                    outlined
                    style="max-width: 80px"
                    @click.stop
                    @change="cantidadIngresada(props.row)"
                    @keyup.enter="
                      seleccionarProducto2(props.row, props.rowIndex)
                    "
                    :ref="
                      (el) => {
                        if (
                          el &&
                          cantidadInputs &&
                          cantidadInputs.value &&
                          typeof props.rowIndex === 'number' &&
                          props.rowIndex >= 0
                        ) {
                          try {
                            cantidadInputs.value[props.rowIndex] = el;
                          } catch (error) {
                            console.warn('Error assigning ref:', error);
                          }
                        }
                      }
                    "
                  >
                    <template #prepend>
                      <q-icon name="shopping_cart" size="sm" />
                    </template>
                  </q-input>
                </q-td>
              </template>

              <!-- Columna personalizada para acción -->
              <template #body-cell-accion="props">
                <q-td :props="props" class="accion-cell">
                  <q-btn
                    @click="seleccionarProducto2(props.row, props.rowIndex)"
                    icon="add_shopping_cart"
                    label="Agregar"
                    size="md"
                    :loading="loadingAgregar"
                    class="btn-agregar-table"
                  />
                </q-td>
              </template>

              <!-- Estado vacío personalizado -->
              <template #no-data>
                <div class="text-center q-pa-xl">
                  <q-icon name="inventory" size="80px" color="grey-4" />
                  <div class="text-h6 text-grey-6 q-mt-md">
                    No se encontraron productos
                  </div>
                  <div class="text-caption text-grey-5">
                    Intenta con otros términos de búsqueda
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal Para Facturación -->
    <q-dialog
      v-model="modalFacturacion"
      @show="enfocarEfectivo"
      persistent
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card class="q-dialog-plugin facturacion-card">
        <!-- Header profesional -->
        <q-card-section
          class="row items-center justify-between facturacion-header"
        >
          <div class="row items-center q-gutter-sm">
            <q-icon name="point_of_sale" size="28px" color="black" />
            <div class="text-h6 text-black">Facturación</div>
            <q-chip
              v-if="contingencia"
              color="red-6"
              align-items="right"
              text-color="white"
              icon="warning"
              size="20px"
              dense
            >
              Contingencia
            </q-chip>
          </div>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="black"
            class="bg-yellow-10"
          />
        </q-card-section>

        <!-- Encabezado de pedido/serie -->
        <q-card-section class="q-pt-sm q-pb-none">
          <div class="row items-center justify-between text-grey-7">
            <div class="row items-center q-gutter-sm">
              <div class="text-h6">
                Pedido No. {{ pedidoStore.numeroDePedido }}
              </div>
            </div>
            <div class="row items-center q-gutter-sm">
              <div class="text-h6">
                Serie:
                {{ configuracionStore.serieSeleccionada || "No hay serie" }}
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Información del cliente y total -->
        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <!-- Total -->
            <div class="col-12">
              <q-card flat class="total-card">
                <q-card-section class="text-center q-pa-none">
                  <div class="text-caption text-grey-6">Total a pagar</div>
                  <div class="text-h4 text-weight-bold">
                    {{ formatCurrency(totalAPagar, 2) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <!-- Método de pago -->
        <q-card-section class="q-pt-sm">
          <div class="row q-col-gutter-sm items-start">
            <div class="col-12">
              <q-select
                v-model="tipoPago"
                :options="opcionesPago2"
                label="Tipo de Pago"
                outlined
                dense
                class="bg-grey-1"
              >
                <template #prepend>
                  <q-icon name="payments" color="primary" />
                </template>
              </q-select>
            </div>

            <div class="col-12 q-mt-sm">
              <q-input
                ref="focusEfectivo"
                v-model.number="montoEfectivo"
                label="Efectivo"
                prefix="Q"
                :disable="tipoPago !== 'EFECTIVO' && tipoPago !== 'MIXTO'"
                outlined
                dense
                class="bg-grey-1"
                input-class="text-bold"
                type="number"
                min="0"
                step="0.01"
                @keydown.enter.prevent="focusBtnConfirmar"
              >
                <template #prepend>
                  <q-icon name="account_balance_wallet" color="brown" />
                </template>
              </q-input>
            </div>

            <div class="col-12 q-mt-sm">
              <q-input
                ref="focusTarjeta"
                v-model.number="montoTarjeta"
                label="Tarjeta"
                prefix="Q"
                :disable="tipoPago !== 'TARJETA' && tipoPago !== 'MIXTO'"
                outlined
                dense
                class="bg-grey-1"
                input-class="text-bold"
                type="number"
                min="0"
                step="0.01"
                @keydown.enter.prevent="focusBtnConfirmar"
              >
                <template #prepend>
                  <q-icon name="credit_card" color="blue" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <!-- Resumen de pago y estado -->
        <q-card-section class="q-pt-none">
          <q-card flat bordered class="resumen-pago-card">
            <!-- Sección de descuento aplicado -->
            <q-card-section v-if="totalAnterior > 0" class="descuento-section">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-grey-8">
                  <q-icon name="local_offer" size="sm" class="q-mr-xs" />
                  Descuento Aplicado
                </div>
                <q-chip
                  color="green-6"
                  text-color="white"
                  size="sm"
                  icon="check_circle"
                >
                  Cupón Válido
                </q-chip>
              </div>

              <div class="row items-center justify-between q-mb-xs">
                <div class="text-body2 text-grey-7">Total original</div>
                <div class="text-subtitle1 text-weight-bold text-red-7">
                  {{ formatCurrency(totalAnterior, 2) }}
                </div>
              </div>

              <div class="row items-center justify-between q-mb-xs">
                <div class="text-body2 text-grey-7">Descuento</div>
                <div class="text-subtitle1 text-weight-bold text-green-7">
                  -{{ formatCurrency(totalAnterior - totalAPagar, 2) }}
                </div>
              </div>

              <q-separator class="q-my-sm" />

              <div class="row items-center justify-between">
                <div class="text-body1 text-weight-bold text-grey-8">
                  Total final
                </div>
                <div class="text-h6 text-weight-bold text-green-7">
                  {{ formatCurrency(totalAPagar, 2) }}
                </div>
              </div>
            </q-card-section>

            <q-card-section>
              <div
                v-if="faltantePago > 0"
                class="row items-center justify-between q-mt-xs q-pb-none"
              >
                <div class="text-body2 text-grey-7">Faltante</div>
                <div
                  class="text-h5 text-weight-bold"
                  :class="{ 'text-negative': faltantePago > 0 }"
                >
                  {{ formatCurrency(faltantePago, 2) }}
                </div>
              </div>
              <div
                v-if="cambioPago > 0"
                class="row items-center justify-between q-mt-xs"
              >
                <div class="text-body2 text-grey-7">Cambio</div>
                <div class="text-weight-bold text-positive text-h5">
                  {{ formatCurrency(cambioPago, 2) }}
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pt-sm q-pb-none">
              <q-banner
                v-if="!isPagoValido"
                dense
                rounded
                class="bg-orange-1 text-orange-9"
              >
                Ingresa un monto de pago igual o superior al total.
              </q-banner>
              <div class="q-mt-sm">
                <q-btn
                  icon="discount"
                  color="yellow-8"
                  class="q-ml-sm text-black"
                  label="Agregar Cupón"
                  @click="abrirCuponazo"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>

        <!-- Acciones -->
        <q-card-actions align="right" class="q-pt-none">
          <q-btn
            ref="btnConfirmarFactura"
            color="secondary"
            icon="taskalt"
            label="Facturar "
            class="q-ml-sm"
            :disable="!isPagoValido"
            @click="confirmarFactura()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de cuponazo -->
    <q-dialog
      v-model="modalCuponazo"
      persistent
      transition-show="fade"
      transition-hide="fade"
    >
      <q-card
        class="q-dialog-plugin q-pa-md"
        style="
          min-width: 400px;
          max-width: 90vw;
          max-height: 90vh;
          border-radius: 10px;
        "
      >
        <q-card-section
          class="row items-center justify-between"
          style="border-radius: 10px"
        >
          <div
            class="text-h6 text-primary q-ml-sm bg-yellow-8 text-black q-pa-xs"
            style="border-radius: 10px"
          >
            Agregar cupón
          </div>
          <q-btn
            class="bg-yellow-8 text-black"
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>

        <q-card-section>
          <q-input
            filled
            ref="refCupon"
            v-model="cupon"
            label="Escribe el cupón"
            @keyup.enter="aplicarCuponazo"
            outlined
            dense
          />
          <q-input
            v-model="clave"
            label="Clave de autorización"
            type="password"
            outlined
            dense
            class="q-mt-md"
            @keyup.enter="aplicarCuponazo()"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            label="Aplicar cupón"
            class="boton-amarillo"
            @click="aplicarCuponazo"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de cantidad-->
    <q-dialog
      v-model="modalCantidad"
      persistent
      transition-show="fade"
      transition-hide="fade"
      @hide="volverAFocusInput"
    >
      <q-card
        class="q-dialog-plugin q-pa-md"
        style="min-width: 400px; max-width: 90vw; max-height: 90vh"
      >
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary">Cantidad del Producto</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            v-model.number="cantidad2"
            ref="focusCantidad"
            label="Cantidad"
            type="number"
            outlined
            dense
            min="1"
            @keyup.enter.prevent="actualizarCantidad()"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>


import { useQuasar } from "quasar";
import { useQueryClient } from "@tanstack/vue-query";
import {
  ref,
  computed,
  onMounted,
  watch,
  watchEffect,
  onBeforeUnmount,
  nextTick,
} from "vue";
import {
  showConfirmationDialog,
  showErrorNotification,
  showSuccessNotification,
  showConfirmationInsideModal,
  showErrorNotificationInside,
  showSuccessNotificationInside,
  runWithLoading,
  mostrarNotificacionCorrectoSonido,
  mostrarNotificacionErrorSonido,
} from "@/common/helper/notification";

import { useProductos } from "@/modules/Productos/composables/useProductos";
import { usePedidoDet } from "@/modules/pedidos_det/composables/usePedidosDet";
import { usePedidoStore } from "@/stores/pedido";
import usePedidosEnc from "../../pedidos_enc/composables/usePedidosEnc";
import { useCodigo } from "@/modules/codigo_barras/composables/useCodigo";
import { useTotalStore } from "@/stores/total";
import { useUserStore } from "@/stores/user";
import { useConfiguracionStore } from "@/stores/serie";
import { useSync } from "@/modules/sync/composables/useSync";
import { usePdfFactura } from "@/modules/facturar_pdf/composables/usePdFactura";
import { useFacturasEnc } from "@/modules/facturas_enc/composables/useFacturasEnc";
import { useCertification } from "@/modules/certification/composables/useCertification";
import { useCupones } from "@/modules/cupones/composables/useCupones";
import useFormat from "@/common/composables/useFormat";
import { useStoreSucursal } from "@/stores/sucursal";
import { cleanAllStores } from "@/common/helper/cleanStore";
import { usePdfCotizacion } from "@/modules/cotizacion_pdf/composable/useCotizacion";
import { obtenerDetallePedido } from "@/modules/pedidos_enc/action/pedidosEncAction";
import { useClienteStore } from "@/stores/cliente";

/*
==========================================================
                      COLUMNAS
==========================================================
*/
const columnasCatalogo = [
  {
    name: "codigo",
    label: "Código / Marca",
    align: "left",
    field: "PRODUCT0",
    sortable: true,
    style: "min-width: 200px",
  },
  {
    name: "descripcion",
    label: "Descripción",
    align: "left",
    field: "DESCRIPCION_PROD",
    sortable: true,
    style: "min-width: 300px",
  },
  {
    name: "precio",
    label: "Precio",
    align: "center",
    field: "PRECIO_SUGERIDO",
    sortable: true,
    style: "min-width: 150px",
  },
  {
    name: "niveles",
    label: "Niveles de Precio",
    align: "left",
    field: "niveles",
    sortable: false,
    style: "min-width: 200px",
  },
  {
    name: "cantidad",
    label: "Cantidad",
    align: "center",
    field: "CANTIDAD_PEDIDA",
    sortable: false,
    style: "min-width: 120px",
  },
  {
    name: "accion",
    label: "Acción",
    align: "center",
    field: "accion",
    sortable: false,
    style: "min-width: 120px",
  },
];

/*
==========================================================
                      PROPS
==========================================================
*/

const props = defineProps({
  pedidoId: {
    type: [Number, null],
    required: false,
    default: null,
  },
  onNuevoPedido: {
    type: Function,
    required: true,
  },
  tipoPedido: {
    type: String,
    required: true,
  }
});

const idPedidoEnc = computed(() => props.pedidoId);
const tipoPedido = computed(() => props.tipoPedido)

// Emits
const emit = defineEmits(['updateEstado']);

const updateEstadoPedido = (nuevoEstado) => {
  emit('updateEstado', nuevoEstado);
}

/*
==========================================================
                  COMPOSABLES FUNCTIONS
==========================================================
*/

const { mutateAgregarContingencia } = useFacturasEnc();
const { formatNumber, formatCurrency } = useFormat();
const storeSucursal = useStoreSucursal();
const { mutateAplicarCupon } = useCupones();
const contingencia = ref(false);
const { mutateCertificar, mutateFacturaContingencia } = useCertification();
const { obtenerDetalleFactura, obtenerFacturaId3 } = useFacturasEnc();
const { generarFacturaPDF } = usePdfFactura();
const { mutateCrearSincronizacion } = useSync();
const {
  mutateCrearPedidoDet,
  useListaProductosPedidoDet,
  obtenerPedidosDetID,
} = usePedidoDet();
const configuracionStore = useConfiguracionStore();
const { mutateCrearFacturaEnc2 } = useFacturasEnc();
const { obtenerPedidoPorId } = usePedidosEnc();
const { todosProductos, refetchTodosProductos, precioReal } = useProductos();

const pedidoStore = usePedidoStore();
const totalStore = useTotalStore();
const userStore = useUserStore();
const queryClient = useQueryClient();
const { consultarCodigoM } = useCodigo();
const $q = useQuasar();
const { mutateAnularPedidoPendiente } = usePedidosEnc();
const { generarCotizacionPDF } = usePdfCotizacion()
const clienteStore = useClienteStore();
const { nombreVendedor } = useUserStore();
const { totalItems } = useTotalStore();

//USE COMPOSABLES
const { data: pedidoData, refetchObtenerPedidoID } =
  obtenerPedidoPorId(idPedidoEnc);
const { refetch: refetchObtenerPedidoDetID } =
  useListaProductosPedidoDet(idPedidoEnc);

const modalFacturacion = ref(false);
const modalCuponazo = ref(false);

/*
==========================================================
                VARIABLES GENERALES
==========================================================
*/
const allowAutoFocusProduct = ref(true); // Controla si el input de código puede auto-enfocarse
const btnConfirmarFactura = ref(null);
const calcularCambio = ref(0);
const cantidad = ref(1); // Cantidad en el boton
const cantidad2 = ref(1); // para modal cantidad
const cantidadInputs = ref({}); // Referencias a los inputs de cantidad en el catálogo
const clave = ref("");
const codigoProducto = ref("");
const cupon = ref("");
const detallesPedido = ref([]);
const filtroProductos = ref("");
const focusCantidad = ref(null); // focus modal cantidad
const focusEfectivo = ref(null); // focus efectivo
const focusTarjeta = ref(null);
const idFacturaEnc = ref(null); // ID de la factura creada
const inputCodigo = ref(null);
const loadingAgregar = ref(false);
const loadingDetalle = ref(false);
const loadingPorCodigo = ref(false);
const loadingProductos = ref(false);
const modalCantidad = ref(false);
const modalProductos = ref(false);
const modalProductos2 = ref(false);
const montoEfectivo = ref(null);
const montoTarjeta = ref(null);
const opcionesPago2 = ["EFECTIVO", "TARJETA", "MIXTO"];
const refCupon = ref();
const tipoPago = ref("EFECTIVO");
const errorAgregarProducto = ref(false);

// Paginación del catálogo
const paginacionCatalogo = ref({
  sortBy: "PRODUCTO",
  descending: false,
  page: 1,
  rowsPerPage: 50,
  rowsPerPage: 50,
});

/*
==========================================================
                    REFERENCIAS (FORMS)
==========================================================
*/
const buscadorProductoRef = ref(null);
const totalAnterior = ref(0);

/*
==========================================================
                    VARIABLES COMPUTED
==========================================================
*/

// Facturación - cálculos y validaciones
const totalAPagar = computed(() =>
  Number(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0)
);
const montoEfectivoNum = computed(() => Number(montoEfectivo.value) || 0);
const montoTarjetaNum = computed(() => Number(montoTarjeta.value) || 0);

const sumaPago = computed(() => {
  if (tipoPago.value === "EFECTIVO") return montoEfectivoNum.value;
  if (tipoPago.value === "TARJETA") return montoTarjetaNum.value;
  return montoEfectivoNum.value + montoTarjetaNum.value;
});
const faltantePago = computed(() =>
  Math.max(0, totalAPagar.value - sumaPago.value)
);
const cambioPago = computed(() =>
  Math.max(0, sumaPago.value - totalAPagar.value)
);
const isPagoValido = computed(
  () => sumaPago.value >= totalAPagar.value && totalAPagar.value > 0
);

// Referencia y helper para enfocar botón Confirmar
const focusBtnConfirmar = async () => {
  await nextTick();
  if (btnConfirmarFactura.value && btnConfirmarFactura.value.$el) {
    btnConfirmarFactura.value.$el.focus();
  }
};

/*
==========================================================
                WATCHS Y WATCH EFFECTS
==========================================================
*/
// focus en modal cupon
watch(modalCuponazo, (val) => {
  if (val)
    nextTick(() => {
      refCupon.value?.$el.querySelector("input")?.select();
    });
});

//focus al modal cantidad
watch(modalCantidad, (val) => {
  if (val) {
    nextTick(() => {
      focusCantidad.value?.$el.querySelector("input")?.select();
    });
  }
});

//cargar productos en factura
watch(modalFacturacion, (val) => {
  if (val) {
    refetchProductosFactura();
  }
});

// cargar nuevos productos
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetchObtenerPedidoID();
  }
});

// actualizar cliente en facturacion
watch(pedidoData, () => {
  refetchObtenerPedidoID();
});

// si el efectivo cambia, calcular cambio
watch(montoEfectivo, (nuevoValor) => {
  if (nuevoValor !== null && nuevoValor >= 0) {
    calcularCambioModal();
  } else {
    calcularCambio.value = 0;
  }
});

// focus desde mixto
watch(tipoPago, async (nuevo) => {
  if (nuevo === "EFECTIVO") {
    await nextTick();
    focusEfectivo.value?.focus();
  } else if (nuevo === "MIXTO") {
    await nextTick();
    focusEfectivo.value?.focus();
  } else if (nuevo === "TARJETA") {
    await nextTick();
    focusTarjeta.value?.focus();
  }
});
// limpiar campos de pago
watch(tipoPago, (nuevo) => {
  if (nuevo === "EFECTIVO") {
    montoTarjeta.value = null;
  } else if (nuevo === "TARJETA") {
    montoEfectivo.value = null;
  } else if (nuevo === "MIXTO") {
    montoEfectivo.value = null;
    montoTarjeta.value = null;
  }
});
// mantener focus y limpiar referencias cuando se cierre el modal
watch(modalProductos2, async (val) => {
  try {
    if (val) {
      // Cuando se abre el modal, asegurar que los productos estén cargados
      await refetchTodosProductos();
      // Reinicializar cantidadInputs cuando se abre el modal
      if (cantidadInputs && cantidadInputs.value) {
        cantidadInputs.value = {};
      }

      // Enfocar el buscador después de que el modal esté completamente renderizado
      await nextTick();
      nextTick(() => {
        if (buscadorProductoRef.value) {
          buscadorProductoRef.value.focus();
          buscadorProductoRef.value.select();
        }
      });
    } else {
      if (allowAutoFocusProduct.value) enfocarCodigo();
      // Limpiar referencias de inputs cuando se cierre el modal
      if (cantidadInputs && cantidadInputs.value) {
        cantidadInputs.value = {};
      }
    }
  } catch (error) {
    console.error("Error in modalProductos2 watch:", error);
  }
});

// filtro del catalogo
const productosFiltrados2 = computed(() => {
  if (!filtroProductos.value) return productosUnicos.value;

  const palabras = filtroProductos.value
    .toLowerCase()
    .split(" ")
    .filter((p) => p.trim() !== "");

  return productosUnicos.value.filter((p) => {
    const campos = `${p.DESCRIPCION_PROD || ""} ${p.DESCRIPCION_MARCA || ""} ${
      p.PRODUCT0 || ""
    }`.toLowerCase();
    return palabras.every((palabra) => campos.includes(palabra));
  });
});

// mapear los productos para mostrar un registro en la tabla
const productosUnicos = computed(() => {
  if (!todosProductos.value) return [];

  const mapa = new Map();

  for (const prod of todosProductos.value) {
    const clave = prod.PRODUCT0;

    const nivelTexto = `${formatCurrency(
      prod.PRECIO_FINAL,
      3
    )} ( ${formatNumber(prod.CANTIDAD_INICIAL)} a ${formatNumber(
      prod.CANTIDAD_FINAL
    )} )`;

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        ...prod,
        niveles: [nivelTexto],
      });
    } else {
      mapa.get(clave).niveles.push(nivelTexto);
    }
  }

  return Array.from(mapa.values());
});

/*
==========================================================
                      FUNCIONES
==========================================================
*/
const cantidadIngresada = (producto) => {
  if (!producto.CANTIDAD_PEDIDA || producto.CANTIDAD_PEDIDA <= 0) {
    showErrorNotification("Cantidad", "Ingrese una cantidad válida");
    return;
  }
};

// Función para refrescar productos en facturación
const refetchProductosFactura = async () => {
  try {
    await refetchObtenerPedidoID();
    await refetchObtenerPedidoDetID();
  } catch (error) {
    console.error("Error al refrescar productos en facturación:", error);
  }
};

// Confirmgar la contigencia
const confirmarContingencia = async () => {
  if (contingencia.value) {
    const confirmado = await showConfirmationInsideModal(
      "Confirmar Contingencia",
      "¿Estás seguro de que deseas activar el modo de contingencia?"
    );
    if (!confirmado) {
      contingencia.value = false;
      return;
    }
  }

  if (contingencia.value) {
    $q.notify({
      type: "warning",
      message: "Modo de contingencia activado",
      position: "top-right",
      color: "red-6",
      timeout: 3000,
      icon: "warning",
    });
  } else {
    $q.notify({
      type: "info",
      message: "Modo de contingencia desactivado",
      position: "top-right",
      color: "blue-6",
      timeout: 3000,
      icon: "info",
    });
  }
};

// Cupon
const aplicarCuponazo = () => {
  const datosCupon = {
    numero_cupon: cupon.value,
    id_pedido_enc: pedidoStore.idPedidoEnc,
    usuario: clave.value,
  };

  // Guardar el total ANTES de aplicar el cupón para calcular el descuento
  const totalAntesDelCupon = pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0;

  mutateAplicarCupon(datosCupon, {
    onSuccess: async (res) => {
      // Establecer el total anterior ANTES de refrescar los datos
      totalAnterior.value = totalAntesDelCupon;

      // Refrescar datos del pedido para obtener el nuevo total
      await refetchObtenerPedidoID();

      // Verificar que realmente se aplicó un descuento
      const nuevoTotal = pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0;
      const descuentoAplicado = totalAntesDelCupon - nuevoTotal;

      // Actualizar el store con el nuevo total
      totalStore.setTotal(nuevoTotal);

      $q.notify({
        type: "positive",
        message: `Cupón aplicado exitosamente. Descuento: ${formatCurrency(
          descuentoAplicado,
          2
        )}`,
        position: "top-right",
        timeout: 4000,
        icon: "check",
      });

      modalCuponazo.value = false;
      clave.value = "";
      cupon.value = "";
      enfocarEfectivo();
    },
    onError: (error) => {
      showErrorNotificationInside("Error", error.message);
      nextTick(() => {
        refCupon.value?.focus();
        refCupon.value?.select();
        refetchObtenerPedidoID();
      });
    },
  });

  enfocarEfectivo();
};

// focus al Efectivo
const enfocarEfectivo = async () => {
  await nextTick();
  focusEfectivo.value?.focus();
};

// focus en modal cupon
watch(modalCuponazo, (val) => {
  if (val)
    nextTick(() => {
      refCupon.value?.$el.querySelector("input")?.select();
    });
});

//focus al modal cantidad
watch(modalCantidad, (val) => {
  if (val) {
    nextTick(() => {
      focusCantidad.value?.$el.querySelector("input")?.select();
    });
  }
});

//cargar productos en factura
watch(modalFacturacion, (val) => {
  if (val) {
    refetchProductosFactura();
  }
});

// cargar nuevos productos
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetchObtenerPedidoID();
  }
});

// actualizar cliente en facturacion
watch(pedidoData, () => {
  refetchObtenerPedidoID();
});

watch(modalProductos, async (val) => {
  if (val) {
    try {
      loadingProductos.value = true;
      await refetchTodosProductos();
    } catch (error) {
      $q.notify({ type: "negative", message: "Error al cargar productos" });
    } finally {
      loadingProductos.value = false;
    }
  }
});

// si el efectivo cambia, calcular cambio
const calcularCambioModal = () => {
  if (opcionesPago2 === "MIXTO") calcularCambio.value = 0;
  else {
    calcularCambio.value = montoEfectivo.value - totalStore.totalGeneral;
  }
};

// Despues del cantidad volver al focus del input
const volverAFocusInput = () => {
  setTimeout(() => {
    if (!allowAutoFocusProduct.value) return;
    inputCodigo.value?.focus();
  }, 100);
};

// focus
const enfocarCodigo = () => {
  if (!allowAutoFocusProduct.value) return;
  inputCodigo.value?.focus();
};

// usar F4
const usarF4 = (e) => {
  if (e.key === "F4") {
    e.preventDefault();
    terminarVenta();
  }
};

const usarF1 = (e) => {
  if (e.key === "F1") {
    e.preventDefault();
    abrirCatalogo2();
  }
};

// limpiar pedido
const usarDelete = (e) => {
  if (e.key === "Delete") {
    e.preventDefault();
    limpiar();
  }
};

// usar multiplicador
const usarMultiplicador = (e) => {
  if (e.key === "*") {
    e.preventDefault();
    abrirModalCantidad();
  }
};

// cerrar modal de cantidad con enter
const actualizarCantidad = () => {
  if (cantidad2.value > 1) {
    modalCantidad.value = false;
    return;
  }
};

const truncateDosDecimales = (numero) => {
  return Math.trunc(numero * 100) / 100;
}

// Preparar actualizacion para pedido
const prepararDataCotizacion = async (idPedido) => {
  const apiResponseDetallePedido = await obtenerDetallePedido(idPedido);

  const items = apiResponseDetallePedido.map((item) => {
    return {
      cantidad: item.CANTIDAD_PEDIDA,
      descripcion: item.DESCRIPCION_PROD,
      precio: formatCurrency(item.PRECIO_UNIDAD_VENTA, 2),
      subtotal: formatCurrency(item.SUBTOTAL_VENTAS + item.MONTO_IVA, 2),
    };
  });

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce((acc, item) => acc + parseFloat(item.subtotal.replace("Q.", "")), 0);

  const dataCotizacion = {
    encabezado: {
      numeroInterno: `${pedidoStore.numeroDePedido}`,
      tipoDocumento: "COTIZACION",
      fechaEmision: new Date().toISOString(),
    },

    observacion: '',

    cliente: {
      nombre: clienteStore.nombre,
      nit: String(clienteStore.documento ?? "CF"),
      direccion: clienteStore.direccion,
    },

    items,

    resumen: {
      subtotal: formatCurrency(subtotal, 2),
      totalPagar: `Q.${truncateDosDecimales(totalStore.totalGeneral).toFixed(2)}`,
      totalItems,
    },
    nombreVendedor: nombreVendedor,
  };

  return dataCotizacion;
}

const imprimirCotizacion = async () => {
  if (pedidoStore.numeroDePedido <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Crear una cotización para imprimir.',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  if (!totalStore) {
    $q.notify({
      type: 'warning',
      message: 'Agregue un producto antes de imprimir la cotización.',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  try {
    $q.loading.show({
      message: 'Imprimiendo cotización',
      boxClass: 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary'
    });

    const datosCotizacion = await prepararDataCotizacion(pedidoStore.idPedidoEnc)

    const success = await generarCotizacionPDF(datosCotizacion);

    if (success) {
      console.log("Cotización generada con exito.")
    } else {
      console.log("Fallo al genera cotización.")
    }
    
    $q.loading.hide();
  } catch (error) {
    console.log('Error al imprimir la cotización: ', error)
  } finally {
    $q.loading.hide()
  }
}

const limpiarPedido = async () => {
  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification("Error", "No hay un pedido seleccionado");
    return;
  }

  const confirmado = await showConfirmationDialog(
    `Limpiar ${tipoPedido.value}`,
    `¿Estás seguro de que deseas limpiar ${tipoPedido.value === 'pedido' ? 'el ' + tipoPedido.value : 'la ' + tipoPedido.value}?`
  );

  if (confirmado) {
    cleanAllStores();
    updateEstadoPedido('pedido')
  }
};

// anular pedido
const limpiar = async () => {
  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification(
      "Error",
      "No existe un pedido o cotización para anular"
    );
    return;
  }

  const confirmado = await showConfirmationDialog(
    `Anular ${tipoPedido.value}`,
    `¿Estás seguro de que deseas anular ${tipoPedido.value === 'pedido' ? 'el ' + tipoPedido.value : 'la ' + tipoPedido.value}?`
  );
  
  if (confirmado) {
    mutateAnularPedidoPendiente(
      {
        id: Number(pedidoStore.idPedidoEnc),
        usuario: String(userStore.nombreVendedor || ""),
      },
      {
        onSuccess: () => {
          $q.notify({
            type: "positive",
            message: `Anulado con éxito`,
            position: "top-right",
            timeout: 3000,
            icon: "check",
          });
        },
      }
    );

    cleanAllStores();
    updateEstadoPedido('pedido')
  }
};

// modal cuponazo
const abrirCuponazo = async () => {
  modalCuponazo.value = true;

  await nextTick();

  refCupon.value?.focus();
};

// nuevo catalogo
const abrirCatalogo2 = async () => {
  try {
    // Asegurar que los productos estén cargados antes de abrir el modal
    await refetchTodosProductos();
    modalProductos2.value = true;
  } catch (error) {
    console.error("Error al cargar productos:", error);
    showErrorNotification("Error", "No se pudieron cargar los productos");
  }
};

const abrirModalCantidad = () => {
  modalCantidad.value = true;
};

// FUNCIONES GENERALES

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const certificarFactura = async (id) => {
  console.log("Iniciando certificacion de factura...");

  // Obtener datos de la factura
  const factura = await obtenerFacturaId3(id);
  // Mostrar loading para certificación
  $q.loading.show({
    message: "Certificando factura...",
    spinnerColor: "green",
    spinnerSize: 50,
  });
  //console.log('yo soy id"', id);
  //console.log('yo soy id"', id);

  // Usar Promise para manejar la mutación de certificación
  mutateCertificar(
    {
      sucursal: storeSucursal.idSucursal,
      serie: factura.SERIE,
      numero: factura.NUMERO_FACTURA,
    },
    { 
      onSuccess: async (data) => {
        console.log("Factura certificada exitosamente");

        // Ocultar loading antes de imprimir
        $q.loading.hide();

        // Si se certifica la factura, se debe de sincronizar
        console.log('yo soy id"', id);
        await mutateCrearSincronizacion(id);

        await imprimirFactura(data);

        $q.notify({
          type: "positive",
          message: "Factura certificada con exito  " + data.Uuid,
          position: "top-right",
          timeout: 3000,
          icon: "check",
        });
      },

      onError: async (error) => {
        console.error("Error en certificación:", error);
        $q.loading.hide();
        
        $q.notify({
          type: "negative",
          message: `Error en certificación: ${error.message}, imprimiendo en contingencia`,
          position: "top-right",
          timeout: 5000,
          icon: "error",
        });

        contingencia.value = true

        await mutateAgregarContingencia(id)

        nextTick() 

        await imprimirFactura(id)

        
        $q.notify({
          type: "negative",
          message: `Error en certificación: ${error.message}, imprimiendo en contingencia`,
          position: "top-right",
          timeout: 5000,
          icon: "error",
        });

        contingencia.value = true

        await mutateAgregarContingencia(id)

        nextTick() 

        await imprimirFactura(id)

      },
    });
};

// modal factura
const terminarVenta = async () => {
  await nextTick(); // Cargar los productos

  // si no existe pedido
  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification(
      "No existe un pedido",
      "Debes de crear un pedido primero"
    );
    return;
  }
  modalFacturacion.value = true;
};

// Guarda factura enc y det
const confirmarFactura = async () => {
  if (!configuracionStore.serieSeleccionada) {
    modalFacturacion.value = false;
    showErrorNotification(
      "No hay serie",
      "No se detectó una serie de facturacion, asigne uno en menu/configuracion "
    );
    return;
  }

  // modal confirmacion factura
  const datos = {
    ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
    USUARIO_QUE_FACTURA: userStore.nombreVendedor,
    SERIE: configuracionStore.serieSeleccionada,
    ES_CONTINGENCIA: contingencia.value,
  };

  // Capturar el cambio actual antes de que muten estados
  const cambioCapturado = cambioPago.value;

  // Mostrar loading manualmente para evitar timeout
  $q.loading.show({
    message: "Facturando...",
    spinnerColor: "primary",
    spinnerSize: 50,
  });

  mutateCrearFacturaEnc2(datos, {
    onSuccess: async (respuesta) => {
      console.log("Pedido facturado correctamente");
      modalFacturacion.value = false;

      // Guardar último cambio para mostrarlo en clienteform luego de cerrar el modal
      totalStore.setUltimoCambio(cambioCapturado);

      // Ocultar loading antes de certificar
      $q.loading.hide();

      // Asignar este valor para llenar la factura
      idFacturaEnc.value = respuesta.ID_FACTURA_ENC;
      // Ahora sí espera a que termine la certificación

      if (contingencia.value === true) {
        await imprimirFactura(respuesta);
        return;
      } else {
        await certificarFactura(respuesta.ID_FACTURA_ENC);
      }
    },
    onError: (error) => {
      console.error("Error creando factura:", error);
      modalFacturacion.value = false;
      $q.loading.hide();
    },
  });

  // LIMPIAR STORES DESPUÉS DE COMPLETAR EXITOSAMENTE
  // Esto se ejecuta solo si todo el proceso de facturación fue exitoso
  cleanAllStores();
};

const imprimirFactura = async (data) => {
  console.log("imprimiendo factura...");
  const factura2 = await obtenerFacturaId3(idFacturaEnc.value);

  // console.log("este es data:", data);
  console.log("imprimir factura2:", factura2);

  // console.log('yo soy contingencia:', contingencia.value)
  // console.log('yo soy contingencia:', contingencia.value)
  // console.log("data certificada con exito: ", data)

  const detalle = await obtenerDetalleFactura(idFacturaEnc.value);
  if (!detalle || detalle.length === 0) return;

  const itemsFactura = detalle.map((item) => ({
    cantidad: item.CANTIDAD_VENDIDA,
    descripcion: item.producto.DESCRIPCION_PROD,
    precio: item.PRECIO_UNITARIO_VTA.toFixed(4),
    subtotal: item.SUBTOTAL_GENERAL.toFixed(4),
  }));

  console.log("detalle: ", detalle);

  const totalItems = itemsFactura.reduce(
    (total, item) => total + Number(item.cantidad),
    0
  );
  const Subtotal = itemsFactura.reduce(
    (subtotal, item) => subtotal + Number(item.subtotal),
    0
  );

  //En mensaje en manual para insertar en fel errores que se habilito la contingencia manualmente
  if (contingencia.value === true) {
    mutateFacturaContingencia({
      sucursal: storeSucursal.idSucursal,
      serie: factura2.SERIE,
      numero: factura2.NUMERO_FACTURA,
    });
  }


  console.log("Imprimiendo 2...");


  const dataFactura = {
    encabezado: {
      serie: data.SerieFacturaFel,
      numero: contingencia.value
        ? factura2.CORR_CONTINGENCIA
        : data.NumeroFacturaFel,
      uuid: data.Uuid,
      fechaEmision: formatearFecha(data.FechaAccion),
      serieInterna: factura2.SERIE,
      numeroInterno: factura2.NUMERO_FACTURA,
      tipoDocumento: contingencia.value
        ? "FACTURA EN CONTINGENCIA"
        : "FACTURA ELECTRONICA",
    },
    cliente: {
      nombre: factura2.NOMBRE_CLI_A_FACTUAR,
      nit: factura2.NIT_CLIEN_A_FACTURAR,
      direccion: factura2.DIRECCION_CLI_FACTUR,
    },
    items: itemsFactura,
    resumen: {
      subtotal: `Q. ${Subtotal.toFixed(2)}`,
      descuento: `Q. ${factura2.MONTO_DESCUENTO_FACT.toFixed(2)}`,
      totalPagar: `Q. ${factura2.TOTAL_GENERAL.toFixed(2)}`,
      totalItems,
    },
    nombreVendedor: factura2.USUARIO_QUE_FACTURA,
    qrCodeData: data.Uuid,
  };

  // console.log(" yo soy data:", dataFactura);
  // console.log(" yo soy data:", dataFactura);
  await nextTick();
  console.log("Imprimiendo 3...");
  await generarFacturaPDF(dataFactura);

  // NOTA: cleanAllStores() se ejecutará DESPUÉS de que todo esté completo
  // para evitar perder datos antes de tiempo

  props.onNuevoPedido();
  // limpiar campos de pago
  montoEfectivo.value = null;
  montoTarjeta.value = null;
  console.log("Imprimiendo 4...");
  // Invalidate pedidos pendientes y refetch
  queryClient.invalidateQueries({
    queryKey: ["pedidos-pendientes"],
  });
  console.log("Finalizando impresion de factura");
};

// mostrar total
const totalEncabezado = computed(() => {
  return pedidoData.value?.TOTAL_PEDIDO ?? 0;
});

const totalPedido = () => {
  return pedidoStore.idPedidoEnc;
};

const limpiarFiltro = () => {
  filtroProductos.value = "";
};

// Buscar producto por código escaneado o ingresado manualmente
const buscarProductoEscaneado = async () => {
  if (!codigoProducto.value) return;

  if (!pedidoStore.idPedidoEnc) {
    await errorAgregarProductoConSonido(
      "No hay un pedido activo. Por favor, crea un nuevo pedido."
    );
    return;
  }

  

  loadingPorCodigo.value = true;
  let resultado = null;
  
  // 1. buscar por código de barras
  try {
    resultado = await consultarCodigoM(codigoProducto.value, cantidad2.value);
  } catch (error) {
    console.warn("Código no encontrado por código de barras:", error);
  }

  // 2. buscar por ID de producto
  if (!resultado || !resultado.producto) {
    
    try {
      const productoDirecto = await precioReal(
        codigoProducto.value,
        cantidad2.value
      );

      if (
        productoDirecto.PRECIO_FINAL === 0 ||
        productoDirecto.PRECIO_FINAL === null
      ) {
        await errorAgregarProductoConSonido(
          `Producto sin precio, El código ${codigoProducto.value} no tiene precio`
        );
        codigoProducto.value = "";
        loadingPorCodigo.value = false;
        nextTick(() => {
          inputCodigo.value?.focus();
        });
        return;
      }

      // Tiene el precio
      const prod = Array.isArray(productoDirecto)
        ? productoDirecto[0]
        : productoDirecto;

      console.log("yo soy prod", prod);

      if (!prod) {
        throw new Error("No encontrado");
      }

      resultado = {
        producto: {
          PRODUCT0: codigoProducto.value,
        },
        precio: {
          PRECIO_FINAL: prod.PRECIO_FINAL,
        },
      };

      console.log("resultado2: ", resultado);
    } catch (err) {
      await errorAgregarProductoConSonido(
        `Error al buscar producto (${codigoProducto.value}) por código: ${err.message || "Error desconocido"}`
      );
      codigoProducto.value = "";
      loadingPorCodigo.value = false;
      nextTick(() => {
         inputCodigo.value?.focus();
      });
      return;
    }
  }
    console.log("Buscando producto por código:", codigoProducto.value);

  //console.log('Este es el resultado',resultado)

  // console.log("Este es codigo PRoducto", codigoProducto.value);
  // console.log("Este es el resultado", resultado);

  // 3. Insertar producto al pedido
  const detalle = {
    ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
    PRODUCT0: resultado.producto.PRODUCT0,
    CANTIDAD_PEDIDA: cantidad2.value || 1, // usar cantidad del modal o 1 por defecto
    PRECIO_UNIDAD_VENTA: Number(resultado.precio.PRECIO_FINAL.toFixed(4)),
    SUBTOTAL_VENTAS: Number((1 * resultado.precio.PRECIO_FINAL).toFixed(4)),
    DESCRIPCION_PROD_AUX: resultado.producto.DESCRIPCION_PROD, // vacio
    ID_SUCURSAL: storeSucursal.idSucursal,
    NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido,
  };

  
  mutateCrearPedidoDet(detalle, {
    onSuccess: async (data) => {
      detallesPedido.value.push(data);
      codigoProducto.value = "";
      await refetchObtenerPedidoID(); // Refrescar datos del pedido primero
      await refetchObtenerPedidoDetID();
      totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0);
      // relistaDet2(); // Refrescar lista de detalles
      cantidad2.value = 1; // Resetear cantidad del modal
      console.log("Producto agregado con éxito:", data);
      
      mostrarNotificacionCorrectoSonido(`${detalle.PRODUCT0} agregado con éxito`);
    },
    onError: async (err) => {
      await errorAgregarProductoConSonido(
        `Error al guardar producto: ${err.message || "Error desconocido"}`
      );
    },
    onSettled: () => {
      loadingPorCodigo.value = false;
      nextTick(() => {
        inputCodigo.value?.focus();
      });
    },
  });
};

// crea pedido det desde catalogo
const agregarProductoAlPedido2 = async (producto) => {
  try {
    const cantidadFinal = producto.CANTIDAD_PEDIDA || 1;

    // Validación
    if (!producto || !producto.PRODUCT0 || cantidadFinal <= 0) {
      console.error("Producto inválido o cantidad no válida");
      return;
    }

    // Mostrar loading
    loadingAgregar.value = true;

    // Obtener precio real desde backend
    const precio = await precioReal(producto.PRODUCT0, cantidadFinal);
    if (!precio || !precio.PRECIO_FINAL) {
      throw new Error("No se pudo obtener el precio real del producto");
    }

    //console.log('Si se guarda en precio xd: ', precio)
    // Armar detalle para guardar
    const detalle2 = {
      ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
      PRODUCT0: producto.PRODUCT0,
      CANTIDAD_PEDIDA: cantidadFinal,
      PRECIO_UNIDAD_VENTA: precio.PRECIO_PROMOCION ?? precio.PRECIO_FINAL,
      SUBTOTAL_VENTAS:
        cantidadFinal * (precio.PRECIO_PROMOCION ?? precio.PRECIO_FINAL),
      DESCRIPCION_PROD_AUX: producto.DESCRIPCION_PROD,
      ID_SUCURSAL: storeSucursal.idSucursal,
      NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido,
    };

    // Enviar a backend
    mutateCrearPedidoDet(detalle2, {
      onSuccess: async (data) => {
        detallesPedido.value.push(data);
        codigoProducto.value = "";
        producto.CANTIDAD_PEDIDA = 1;
        await refetchObtenerPedidoID(); // Refrescar datos del pedido primero
        await refetchObtenerPedidoDetID();
        // relistaDet2();
        totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0);
        if (allowAutoFocusProduct.value) enfocarCodigo();

        $q.notify({
          type: "success",
          message: `Producto ${detalle2.PRODUCT0} agregado con exito`,
          position: "top",
          color: "green",
          timeout: 2000,
          group: false, // se muestra de inmediato
          progress: false,
        });

        //console.log('detalle2',detalle2)
      },
      onError: async (error) => {
        console.error("Error al guardar producto en BD:", error);
        await errorAgregarProductoConSonido(
          `Error al agregar producto: ${error.message || "Error desconocido"}`
        );
        throw new Error(error);
      },
      onSettled: () => {
        loadingAgregar.value = false;
      },
    });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    loadingAgregar.value = false;
  }
};

// Mover foco al siguiente producto en el catálogo
const moverFocoAlSiguienteProducto = (indexActual) => {
  if (typeof indexActual !== "number" || indexActual < 0) {
    console.warn(
      "Invalid index for moverFocoAlSiguienteProducto:",
      indexActual
    );
    return;
  }

  const siguienteIndex = indexActual + 1;

  // Verificar si existe un siguiente producto y si los datos están disponibles
  if (
    productosFiltrados2.value &&
    Array.isArray(productosFiltrados2.value) &&
    siguienteIndex < productosFiltrados2.value.length &&
    cantidadInputs &&
    cantidadInputs.value
  ) {
    nextTick(() => {
      try {
        const siguienteInput = cantidadInputs.value[siguienteIndex];
        if (siguienteInput && typeof siguienteInput.focus === "function") {
          siguienteInput.focus();
          if (typeof siguienteInput.select === "function") {
            siguienteInput.select();
          }
        }
      } catch (error) {
        console.warn("Error moving focus to next product:", error);
      }
    });
  }
};

// enviar producto desde catalogo
const seleccionarProducto2 = async (producto, index) => {
  try {
    await agregarProductoAlPedido2(producto);

    // Mover foco al siguiente producto después de agregar
    await nextTick();
    moverFocoAlSiguienteProducto(index);
  } catch (error) {
    console.error("Error in seleccionarProducto2:", error);
  }
};

const errorAgregarProductoConSonido = async (mensajeError) => {
  errorAgregarProducto.value = true;
  errorAgregarProducto.value = await mostrarNotificacionErrorSonido(mensajeError);

};

/*
==========================================================
              LIFE HOCKS (CICLOS DE VIDA)
==========================================================
*/
// Multiplicador
onMounted(() => {
  window.addEventListener("keydown", usarMultiplicador);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarMultiplicador);
});

// limpiar
onMounted(() => {
  window.addEventListener("keydown", usarDelete);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarDelete);
});

// Abrir facturacion con F4
onMounted(() => {
  window.addEventListener("keydown", usarF4);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarF4);
});

// Abrir Catalogo
onMounted(() => {
  window.addEventListener("keydown", usarF1);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarF1);
});

// Inicializar cantidadInputs de manera segura
onMounted(() => {
  cantidadInputs.value = {};
});

// Limpiar cantidadInputs al desmontar
onBeforeUnmount(() => {
  if (cantidadInputs && cantidadInputs.value) {
    cantidadInputs.value = {};
  }
});

defineExpose({
  enfocarCodigo,
  totalPedido,
});
</script>

<style scoped>
.facturacion-card {
  width: min(500px, 96vw);
  max-width: 96vw;
  max-height: 92vh;
}

.facturacion-header {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #181717;
  padding: 10px 14px;
  border-radius: 8px 8px 0 0;
}

.pedido-detalle-container {
  padding: 6px 6px 0px 0;
  max-width: auto;
  margin: 0 auto;
}

.pedido-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  margin-bottom: 8%;
}

.total-badge {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  padding: 16px 24px;
  border-radius: 12px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 15px rgba(17, 153, 142, 0.3);
}

.search-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-input {
  background: white;
  border-radius: 8px;
}

.cantidad-input {
  background: white;
  border-radius: 8px;
}

.productos-table-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.productos-table .q-table__top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.producto-row {
  transition: all 0.2s ease;
  color: black;
}

.producto-row:hover {
  background-color: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

.producto-info {
  max-width: 300px;
  font-weight: bold;
}

.precio-info {
  text-align: right;
}

.cantidad-edit {
  background: white;
}

.delete-btn {
  transition: all 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.catalogo-modal {
  border-radius: 12px;
}

.catalogo-table .q-table__top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.catalogo-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.catalogo-row:hover {
  background-color: rgba(102, 126, 234, 0.05);
  transform: translateY(-1px);
}

.producto-catalogo {
  max-width: 400px;
  font-weight: bold;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
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

#oferta .text-strike {
  text-decoration: line-through;
}
.text-green {
  color: #2e7d32;
}
.text-red {
  color: #c62828;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pedido-detalle-container {
    padding: 8px;
  }

  .pedido-header {
    padding: 16px;
    margin-bottom: 12px;
  }

  .total-badge {
    padding: 12px 16px;
    margin-top: 12px;
  }

  .search-card .q-card-section {
    padding: 12px;
  }

  .row.q-gutter-md {
    gap: 8px;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.producto-row {
  animation: fadeIn 0.3s ease-out;
}

/* Estilos para inputs focus */
.search-input .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.cantidad-input .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Estilos para botones */
.q-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Estilos para chips */
.q-chip {
  border-radius: 6px;
  font-weight: 500;
}

/* tabla */
.q-table tbody td {
  padding: 8px 16px;
}

.q-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

/* Estilos para la sección de descuento */
.descuento-section {
  background: linear-gradient(135deg, #f8fff8 0%, #f0fff0 100%);
  border-left: 4px solid #4caf50;
  border-radius: 8px;
}

.descuento-section .text-green-7 {
  color: #2e7d32 !important;
}

.descuento-section .text-red-7 {
  color: #c62828 !important;
}

/* Mejoras para el resumen de pago */
.resumen-pago-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resumen-pago-card .q-card-section {
  padding: 16px;
}

.resumen-pago-card .q-separator {
  background: #e0e0e0;
  margin: 8px 0;
}

.toggle-brillante.q-toggle--truthy {
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 10px 4px rgba(255, 235, 59, 0.6); /* amarillo brillante */
  border-radius: 999px;
}

/* ===== ESTILOS PARA EL MODAL DE CATÁLOGO MEJORADO ===== */

/* Header del modal */
.catalogo-header {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 4px 20px rgba(255, 235, 59, 0.3);
}

/* Contenedor del buscador */
.search-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* Input de búsqueda mejorado */
.search-input-enhanced {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.search-input-enhanced .q-field--focused .q-field__control {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

/* Tabla de catálogo mejorada */
.catalogo-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.catalogo-table .q-table__top {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
  padding: 16px 20px;
}

.catalogo-table .q-table__thead th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.catalogo-table .q-table__tbody tr {
  transition: all 0.2s ease;
}

.catalogo-table .q-table__tbody tr:hover {
  background-color: rgba(255, 235, 59, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 235, 59, 0.2);
}

.catalogo-table .q-table__tbody td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

/* Celdas personalizadas */
.codigo-cell {
  min-width: 200px;
  white-space: normal;
  word-break: break-word;
}

.codigo-cell .text-weight-bold {
  color: #fbc02d;
  font-size: 1rem;
}

.codigo-cell .text-caption {
  color: #6c757d;
  font-size: 0.8rem;
}

.descripcion-cell {
  min-width: 300px;
  word-break: break-word;
  white-space: normal;
}

.descripcion-cell .text-weight-medium {
  color: #2c3e50;
  font-size: 0.95rem;
  line-height: 1.4;
}

.precio-cell {
  min-width: 150px;
  text-align: center;
  white-space: normal;
  word-break: break-word;
}

.precio-normal-table .text-weight-bold {
  color: #fbc02d;
  font-size: 1.1rem;
}

.precio-oferta-table {
  position: relative;
  padding: 8px;
  background: linear-gradient(135deg, #f6fff5 0%, #fed7d7 100%);
  border-radius: 6px;
  border: 1px solid #7cf186;
  text-align: center;
}

.precio-anterior-table {
  font-size: 0.85rem;
  color: #6c757d;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.precio-actual-table {
  font-size: 1.1rem;
  font-weight: 700;
  color: #75ce3a;
  margin-bottom: 4px;
}

.oferta-chip {
  font-size: 0.7rem;
  font-weight: 700;
  transform: rotate(-5deg);
}

.vigencia-chip {
  font-size: 0.65rem;
  font-weight: 600;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border: 1px solid #e65100;
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
}

.niveles-cell {
  min-width: 200px;
}

.niveles-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nivel-row {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.nivel-chip {
  width: 100%;
  justify-content: flex-start;
  border-radius: 4px;

  font-weight: 500;
}

.cantidad-cell {
  min-width: 120px;
  text-align: center;
}

.cantidad-cell .q-input {
  max-width: 80px;
}

.cantidad-cell .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(255, 235, 59, 0.3);
}

.accion-cell {
  min-width: 120px;
  text-align: center;
}

.btn-agregar-table {
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
}

.btn-agregar-table:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 235, 59, 0.4);
}

/* Responsive para la tabla */
@media (max-width: 1200px) {
  .catalogo-table {
    font-size: 0.9rem;
  }

  .catalogo-table .q-table__tbody td {
    padding: 8px 12px;
  }
  .descripcion-cell {
    min-width: 240px;
  }
  .codigo-cell {
    min-width: 160px;
  }
  .precio-cell {
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .catalogo-table {
    font-size: 0.8rem;
  }

  .catalogo-table .q-table__thead th {
    font-size: 0.8rem;
    padding: 8px 6px;
  }

  .catalogo-table .q-table__tbody td {
    padding: 6px 8px;
  }

  .codigo-cell,
  .descripcion-cell,
  .precio-cell,
  .niveles-cell,
  .cantidad-cell,
  .accion-cell {
    min-width: auto;
  }
  .descripcion-cell {
    min-width: 180px;
  }
  .codigo-cell {
    min-width: 120px;
  }
  .precio-cell {
    min-width: 96px;
  }
}

/* Animaciones para las filas */
@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.catalogo-table .q-table__tbody tr {
  animation: fadeInRow 0.3s ease-out;
}

.catalogo-table .q-table__tbody tr:nth-child(1) {
  animation-delay: 0.1s;
}
.catalogo-table .q-table__tbody tr:nth-child(2) {
  animation-delay: 0.2s;
}
.catalogo-table .q-table__tbody tr:nth-child(3) {
  animation-delay: 0.3s;
}
.catalogo-table .q-table__tbody tr:nth-child(4) {
  animation-delay: 0.4s;
}
.catalogo-table .q-table__tbody tr:nth-child(5) {
  animation-delay: 0.5s;
}
.catalogo-table .q-table__tbody tr:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
