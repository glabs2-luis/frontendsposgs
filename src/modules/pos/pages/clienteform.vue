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
              toggle-color="indigo"
              color="grey-1"
              text-color="black"
              :options="[
                {label: 'Pedido', value: 'pedido'},
                {label: 'Cotizacion', value: 'cotización'}
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
                        @update:model-value="busquedaAutomatica"
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
              icon="assignment"
              size="sm"
              color="deep-orange-5"
              class="text-caption"
              unelevated
              rounded
              style="min-height: 38px"
            ></q-toggle>
            <q-tooltip> Validador de Nit</q-tooltip>
          </q-card>

          <!-- Modal de Pedidos Pendientes -->
          <q-dialog v-model="modalPendientes">
            <q-card class="q-pa-md" style="min-width: 900px">
              <q-card-section class="row items-center q-pb-none">
                <q-icon name="assignment" color="deep-orange-6" />
                <span class="q-ml-md text-subtitle1">Pedidos y Cotizaciones Pendientes</span>

                <q-space />

                <q-btn icon="close" flat dense round v-close-popup />
              </q-card-section>

              <q-tabs
                v-model="tab"
                dense
                class="text-grey-7"
                active-color="primary"
                indicator-color="primary"
                align="justify"
              >
                <q-tab name="pedidos" label="Pedidos" />
                <q-tab name="cotizaciones" label="Cotizaciones" />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tab" animated>
                <q-tab-panel name="pedidos">
                  <!-- <p class="text-caption">Lista de pedidos no facturados</p> -->

                  <q-input
                    dense
                    debounce="300"
                    v-model="filtroPedidos"
                    placeholder="Buscar pedidos..."
                    class="q-mb-md"
                  >
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>

                  <q-markup-table flat bordered class="q-mt-sm tabla-elegante">
                    <thead>
                      <tr>
                        <th class="text-left"><strong># Pedido</strong></th>
                        <th class="text-left"><strong>Cliente</strong></th>
                        <th class="text-left"><strong>Nit</strong></th>
                        <th class="text-left"><strong>Total</strong></th>
                        <th class="text-center"><strong>Anular</strong></th>
                        <th class="text-center"><strong>Continuar</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="pedido in filteredPedidos"
                        :key="pedido.NUMERO_DE_PEDIDO"
                      >
                        <td>{{ pedido.NUMERO_DE_PEDIDO }}</td>
                        <td>{{ pedido.NOMBRE_A_FACTURAR }}</td>
                        <td>{{ pedido.NIT_A_FACTURAR }}</td>
                        <td>Q. {{ pedido.TOTAL_GENERAL_PEDIDO.toFixed(2) }}</td>
                        <td class="text-center">
                          <q-btn
                            icon="close"
                            color="red-6"
                            flat
                            dense
                            label=""
                            @click="anularPedido(pedido)"
                          ></q-btn>
                        </td>
                        <td class="text-center">
                          <q-btn
                            icon="input"
                            color="green-8"
                            flat
                            dense
                            label=""
                            @click="continuarPedido(pedido)"
                          ></q-btn>
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-tab-panel>

                <q-tab-panel name="cotizaciones">
                  <!-- <p class="text-caption">Lista de cotizaciones pendientes</p> -->
                  
                  <q-input
                    dense
                    debounce="300"
                    v-model="filtroCotizaciones"
                    placeholder="Buscar cotizaciones..."
                    class="q-mb-md"
                  >
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>

                  <q-markup-table flat bordered class="q-mt-sm tabla-elegante">
                    <thead>
                      <tr>
                        <th class="text-left"><strong># Cotización</strong></th>
                        <th class="text-left"><strong>Cliente</strong></th>
                        <th class="text-left"><strong>Nit</strong></th>
                        <th class="text-left"><strong>Total</strong></th>
                        <th class="text-center"><strong>Anular</strong></th>
                        <th class="text-center"><strong>Continuar</strong></th>
                        <th class="text-center"><strong>Imprimir</strong></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="pedido in filteredCotizaciones"
                        :key="pedido.NUMERO_DE_PEDIDO"
                      >
                        <td>{{ pedido.NUMERO_DE_PEDIDO }}</td>
                        <td>{{ pedido.NOMBRE_A_FACTURAR }}</td>
                        <td>{{ pedido.NIT_A_FACTURAR }}</td>
                        <td>Q. {{ pedido.TOTAL_GENERAL_PEDIDO.toFixed(2) }}</td>
                        <td class="text-center">
                          <q-btn
                            icon="close"
                            color="red-6"
                            flat
                            dense
                            label=""
                            @click="anularPedido(pedido)"
                          ></q-btn>
                        </td>
                        <td class="text-center">
                          <q-btn
                            icon="input"
                            color="green-8"
                            flat
                            dense
                            label=""
                            @click="continuarPedido(pedido)"
                          ></q-btn>
                        </td>
                        <td class="text-center">
                          <q-btn
                            icon="print"
                            color="primary"
                            flat
                            dense
                            label=""
                            @click="imprimirCotizacion(pedido)"
                          ></q-btn>
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-tab-panel>
              </q-tab-panels>

              <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>



        </div>

        <!-- Boton para modal pedidos/cotizaciones pendientes -->
        <div
          class="btn-pendientes-container"
        >
          <q-btn
            icon="assignment"
            color="red"
            class="color: black"
            @click="abrirModalPedidosPendientes"
          />
        </div>

        <!-- Botones al lado derecho -->
        <div class="col-auto q-ml-sm">
          <q-card flat class="q-pa-sm bg-white shadow-3">
            <div class="row items-center q-gutter-sm no-wrap">
              <!-- Número de Pedido -->
              <div v-if="mostrarNumPedido" class="row items-center q-gutter-xs">
                <q-icon name="receipt_long" color="primary" size="sm" />
                <div
                  class="text-subtitle2 text-primary"
                  style="font-size: 160%"
                >
                  {{ estadoPedido }} #{{ numPedido2 }}
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
      </div>
    </div>
  </div>

  <ProductosTab
    ref="productosTabRef"
    :pedidoId="idPedidoEnc"
    :pedidoId="idPedidoEnc"
    :onNuevoPedido="nuevoPedido"
    :tipoPedido="estadoPedido"
    @update-estado="handleActualizarPedido"
  />
  <TablaProductos
    ref="tablaProductosRef"
    :-pedido-id="idPedidoEnc"
    :-pedido-id="idPedidoEnc"
    :onProductoEliminado="enfocarInputCodigo"
  />
  <q-footer class="z-max">
    <div class="bg-yellow-8 text-black q-pa-sm row items-center justify-center">
      <div class="q-pr-md">
        <div class="text-weight-bold">Libreria San Bartolome - 2025</div>
      </div>

      <div class="cambio row items-center q-gutter-xs">
        <q-icon name="undo" size="sm" class="" />
        <div class="text-balance text-weight-bold">
          Cambio: {{ formatCurrency(totalStore.ultimoCambio, 2) }}
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
import { obtenerDetallePedido } from "@/modules/pedidos_enc/action/pedidosEncAction";

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
const idPedidoEnc =  computed(() => pedidoStore.idPedidoEnc||0); // Aseguramos que sea un número
const { data: pedidoEnc } = obtenerPedidoPorId(idPedidoEnc);  
const mostrarNumPedido = computed(() => pedidoStore.numeroDePedido || 0);
const numPedido2 = computed(() => pedidoStore.numeroDePedido || 0); // pedido funcional
const estadoPedido = computed(() => pedidoStore.estadoPedido === 'P' ? 'Pedido' : 'Cotización');
const focus2 = ref<HTMLInputElement | null>(null)
let espera: ReturnType<typeof setTimeout> | null = null // Para la busqueda automatica
const tipoTransaccion = ref(pedidoStore.tipoPedido); // Valor inicial
const tab = ref('pedidos')
const { generarCotizacionPDF } = usePdfCotizacion()
const filtroPedidos = ref('');
const filtroCotizaciones = ref('');

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
    crearPedido();
  }
});

watch(mostrarNumPedido, async () => [(pedidoStore.estadoPedido = "P")]);

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
})

//busqueda automatica
const busquedaAutomatica = () => {
  if (espera) clearTimeout(espera); // Limpir tiempo

  if (clienteStore.documento.length > 7) {
    //  Longitud mayor a 7 para buscar
    espera = setTimeout(() => {
      buscarClienteDPINIT2();
    }, 500);
  }
};

// Funcion para manejar el estado del pedido
const handleActualizarPedido = (nuevoEstado: string) => {
  tipoTransaccion.value = nuevoEstado;
}

// Anular pedido pendiente
const anularPedido = async (pedido: PedidosEnc) => {
  const tipoPedido = pedido.ESTADO_PEDIDO === 'P' ? 'pedido' : 'cotización'

  const confirmado = await showConfirmationInsideModal(
    `Anular ${estadoPedido.value}`,
    `¿Está seguro que desea anular ${
      estadoPedido.value === "Pedido" ? "el" : "la"
    } ${estadoPedido.value} #${pedido.NUMERO_DE_PEDIDO}?`
  );

  if (!confirmado) return;

  mutateAnularPedidoPendiente({
    id: pedido.ID_PEDIDO_ENC,
    usuario: userStore.nombreVendedor,
  });

  tipoTransaccion.value = "pedido";
};

// continuar pedido pendiente
const continuarPedido = async (pedido) => {
  const tipoPedido = pedido.ESTADO_PEDIDO === 'P' ? 'pedido' : 'cotización'

  const confirmado = await showConfirmationInsideModal(
    `Continuar ${tipoPedido}`,
    `¿Está seguro que desea continuar con ${tipoPedido === "pedido" ? "el" : "la"} ${tipoPedido} N° ${pedido.NUMERO_DE_PEDIDO}?`
  );

  if (!confirmado) return;

  // cleanAllStores();
  await nextTick();

  await formRef.value?.resetValidation();
  // Enfocar productosTab para continuar
  await productosTabRef.value?.enfocarCodigo();

  // Actualizar el store con el ID del pedido pendiente
  pedidoStore.setPedidoEncabezado(
    pedido.ID_PEDIDO_ENC,
    pedido.NUMERO_DE_PEDIDO,
    pedido.CODIGO_VENDEDOR,
    pedido.ESTADO_PEDIDO,
  );

  // set cliente
  clienteStore.setCliente({
    documento: pedido.NIT_A_FACTURAR,
    nombre: pedido.NOMBRE_A_FACTURAR,
    direccion: pedido.DIRECCION_FACTURAR,
    telefono: pedido.TELEFONO_CLIENTE || null, // no viene la info
    email: pedido.EMAIL_CLIENTE || null, // no viene la info
  });

  tipoTransaccion.value = tipoPedido

  // Cerrar modal de pendientes
  modalPendientes.value = false;

  // Enfocar productosTab para continuar
  await productosTabRef.value?.enfocarCodigo();
};

const truncateDosDecimales = (numero) => {
  return Math.trunc(numero * 100) / 100;
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Preparar actualizacion para pedido
const prepararDataCotizacion = async (pedido: PedidosEnc): Promise<DataCotizacion> => {
  const apiResponseDetallePedido = await obtenerDetallePedido(pedido.ID_PEDIDO_ENC);

  const items = apiResponseDetallePedido.map((item: any) => {
    return {
      cantidad: item.CANTIDAD_PEDIDA,
      descripcion: item.DESCRIPCION_PROD,
      precio: formatCurrency(item.PRECIO_UNIDAD_VENTA, 2),
      subtotal: formatCurrency(item.SUBTOTAL_VENTAS + item.MONTO_IVA, 2),
    };
  });

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce((acc, item) => acc + parseFloat(item.subtotal.replace("Q.", "")), 0);

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
      totalPagar: `Q.${truncateDosDecimales(pedido.TOTAL_GENERAL_PEDIDO).toFixed(2)}`,
      totalItems,
    },
    nombreVendedor: pedido.USUARIO_INGRESO_PEDI,
  };

  return dataCotizacion;
}

// Imprimir cotizacion
const imprimirCotizacion = async (pedido) => {
  if (!pedido.TOTAL_GENERAL_PEDIDO) {
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

    const datosCotizacion = await prepararDataCotizacion(pedido)

    const success = await generarCotizacionPDF(datosCotizacion);

    if (success) {
      console.log("Cotización generada con éxito.")
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

// signo menos
onMounted(() => {
  window.addEventListener("keydown", usarMenos);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", usarMenos);
});

// usar tecla - para abrir modal pendientes
const usarMenos = (e) => {
  if (e.key === "-") {
    e.preventDefault();
    abrirModalPedidosPendientes();
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
    expansion.value?.hide();
  }
};

// Cerrar expansion cuando se crea un pedido
watchEffect(() => {
  const cerrar = pedidoStore.idPedidoEnc;

  if (cerrar > 0) {
    expansion.value?.hide();
  }
});

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
    // console.log("Pedido actualizado desde query:", {
    //   numero: numPedido.value,
    //   total: totalReal.value,
    // });
  }
});

const { data: pedidosPendientes, isLoading, refetch:refetchPedidosPendientes } = obtenerPedidosPendientes(
  Number(storeSucursal.idSucursal), // Convertido a numero
  userStore.codigoVendedor
);

// Propiedad computada para filtrar la lista de pedidos
const filteredPedidos = computed(() => {
  if (!pedidosPendientes.value) {
    return [];
  }
  const searchTerm = filtroPedidos.value.toLowerCase();
  
  return pedidosPendientes.value.filter(p => {
    const isPending = p.ESTADO_PEDIDO === 'P';
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
  
  return pedidosPendientes.value.filter(p => {
    const isQuote = p.ESTADO_PEDIDO === 'C';
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
const crearPedido = () => {
  if (pedidoStore.idPedidoEnc) {
    showErrorNotification(
      "Error",
      "Ya existe un pedido pendiente, por favor anule o factura el pedido pendiente antes de crear uno nuevo"
    );
    return;
  }

  const nombre = clienteStore.nombre?.trim();
  const direccion = clienteStore.direccion?.trim();
  const nit = clienteStore.documento?.trim();

  if (!nombre || !direccion || !nit) {
    showErrorNotification(
      "Datos incompletos",
      "Debe seleccionar un cliente válido antes de crear el pedido"
    );
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
    CODIGO_DE_CLIENTE: obtenerConfiguracionPos.value.CODIGO_CLIENTE_CF, // Cliente Ticket
    ESTADO_PEDIDO: tipoTransaccion.value === "pedido" ? "P" : "C",
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
        data.ESTADO_PEDIDO,
      );

      mostrarCardPedidoCreado.value = true;
      mostrarCardTotal.value = true;

      // notificaccion de creado
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
      productosTabRef.value?.enfocarCodigo();
    },
    onError: (error: any) => {
      showErrorNotification(
        "Error al crear",
        error.message ||
          `No se pudo registrar ${
            tipoTransaccion.value === "pedido" ? "el" : "la"
          } ${estadoPedido.value}`
      );
    },
  });

  //focus
  productosTabRef.value?.enfocarCodigo();
};

// Funcion para Colocar CF
const colocarCF = async () => {
  const cf = await refetchMostrarCF();

  if (cf.data) {
    clienteStore.setCliente({
      documento: cf.data.NIT || "",
      nombre: cf.data.NOMBRE || "",
      direccion: cf.data.DIRECCION || "",
      telefono: cf.data.TELEFONO || "",
      email: cf.data.CORREO_ELECTRONICO || "",
    });
    crearPedido();
    expansion.value?.hide();
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
        documento: clienteBD.NIT || "",
        nombre: clienteBD.NOMBRE || "",
        direccion: clienteBD.DIRECCION || "",
        telefono: clienteBD.TELEFONO || "",
        email: clienteBD.CORREO_ELECTRONICO || "",
      });
      return;
    }

    // 2) SEGUNDO: SAT (si el validador está activo)
    if (validador.value) {
      // Loadingsd
      const result = await runWithLoading(
        () =>
          DatosSat2(
            nit.value,
            tipoDocumento.value,
            validador.value,
            empresa.value
          ),
        "Consultando datos en SAT…"
      );

      // Consolar los resultados
      // console.log("Tipo de documento:", tipoDocumento.value);
      // console.log(
      //   "Este es el resultado de consultar datos en la sat: ",
      //   result.data
      // );
      // console.log("valor booleano sat", result.isCertified);

      const nombreSat = result.data.nombre; // Guardar el nombre retornado de sat

      // result = texto
      if (result.isCertified === false) {
        showErrorNotification("Error", result.data.nombre);
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
        clienteStore.nombre = clienteTemp.value.NOMBRE;
        clienteStore.direccion = clienteTemp.value.DIRECCION;
        clienteStore.telefono = clienteTemp.value.TELEFONO;
        clienteStore.documento = clienteTemp.value.NIT
          ? clienteTemp.value.NIT
          : clienteTemp.value.DPI;
      }
    }

    // 4) Si no hay en BD y SAT no devolvió nombre -> abrir modal solo con NIT
    abrirModalCliente.value = true;
    clienteTemp.value.NIT = doc;
    clienteTemp.value.DIRECCION = "Ciudad";
  } catch (err) {
    showConfirmationDialog("Error:", err);
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
      documento: clienteEncontrado.NIT || "",
      nombre: clienteEncontrado.NOMBRE || "",
      direccion: clienteEncontrado.DIRECCION || "",
      telefono: clienteEncontrado.TELEFONO || "",
      email: clienteEncontrado.CORREO_ELECTRONICO || "",
    });

    expansion.value?.toggle();
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
    onSuccess: (creado: any) => {
      clienteStore.setCliente({
        documento: creado.DPI || creado.NIT || "",
        nombre: creado.NOMBRE,
        direccion: creado.DIRECCION,
        telefono: creado.TELEFONO || "",
        email: creado.CORREO_ELECTRONICO || "",
      });

      abrirModalCliente.value = false;
      expansion.value?.toggle();

      $q.notify({
        type: "success",
        message: "Cliente creado satisfactoriamente",
        position: "top",
        color: "green",
        timeout: 2000,
      });
    },
    onError: (error: any) => {
      console.error("Error creando cliente:", error);
      showErrorNotification(
        "Error",
        error.message || "No se pudo registrar el cliente"
      );
    },
  });
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
  font-size: 18px;
  margin-right: 60px;
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
  margin: 8px 0px 0px;
}

.btn-pendientes {
  padding: 8px 15px;
  border-radius: 10px;
}

</style>
