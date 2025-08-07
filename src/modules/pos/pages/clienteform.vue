<template>
  <div class="row">
    <div class="col-12">
      <!-- informacion mas pedido y cantidad-->
      <div class="row items-start no-wrap q-gutter-sm">
        <!-- ExpansionItem -->
        <div class="col">
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
                <q-item-label caption class="text-black text-weight-bold">
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
                        :rules="[(val) => !!val || 'Requerido']"
                        hide-bottom-space
                        style="font-size: 13px"
                        @keydown.enter.prevent="buscarClienteDPINIT2"
                        @keydown="usarF2"
                      >
                        <template v-slot:append>
                          <q-btn
                            flat
                            dense
                            icon="search"
                            color="primary"
                            @click="buscarClienteDPINIT"
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

                    <div class="col-3">
                      <q-input
                        v-model="clienteStore.telefono"
                        label="Teléfono"
                        dense
                        outlined
                        mask="####-####"
                        style="font-size: 13px"
                      />
                    </div>

                    <div class="col-6">
                      <q-input
                        v-model="clienteStore.email"
                        label="Email"
                        dense
                        outlined
                        type="email"
                        style="font-size: 13px"
                      />
                    </div>
                  </div>
                </q-form>
              </div>
            </q-card>
          </q-expansion-item>
        </div>

        <!-- Validado Nit-->
        <!-- <div class="col-auto q-ml-sm">
           <q-card flat bordered class="q-pa-sm bg-white shadow-3" >
              <q-btn label="" icon="assignment" size="sm" color="deep-orange-5" class="text-caption" unelevated rounded  style="min-height: 38px" @click="abrirModalPedidosPendientes"
              />
            </q-card>

        </div> -->

        <!-- Ver Pedidos Pendientes -->
        <div class="col-auto q-ml-sm">
          <q-card flat bordered class="q-pa-sm bg-white shadow-3">
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

            <q-btn
              label="Pendientes"
              icon="assignment"
              size="sm"
              color="deep-orange-5"
              class="text-caption q-ml-sm"
              unelevated
              rounded
              style="min-height: 38px"
              @click="abrirModalPedidosPendientes"
            />
          </q-card>

          <!-- Modal de Pedidos Pendientes -->
          <q-dialog v-model="modalPendientes">
            <q-card class="q-pa-md" style="min-width: 750px">
              <q-card-section class="row items-center q-pb-none">
                <q-icon name="assignment" color="deep-orange-6" />
                <span class="q-ml-md text-subtitle1">Pedidos Pendientes</span>

                <q-space />

                <q-btn icon="close" flat dense round v-close-popup />
              </q-card-section>

              <q-card-section>
                <p class="text-caption">Lista de pedidos no facturados</p>

                <q-markup-table flat bordered class="q-mt-sm tabla-elegante">
                  <thead>
                    <tr>
                      <th class="text-left"><strong># Pedido</strong></th>
                      <th class="text-left"><strong>Cliente</strong></th>
                      <th class="text-left"><strong>Nit</strong></th>
                      <th class="text-left"><strong>Total</strong></th>
                      <th class="text-center"><strong>Anular</strong></th>
                      <th class="text-center"><strong>continuar</strong></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="pedido in pedidosPendientes"
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
              </q-card-section>

              <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>

        <!-- Botones al lado derecho -->
        <div class="col-auto q-ml-sm">
          <q-card flat bordered class="q-pa-sm bg-white shadow-3">
            <div class="row items-center q-gutter-sm no-wrap">
              <!-- Número de Pedido -->
              <div v-if="mostrarNumPedido" class="row items-center q-gutter-xs">
                <q-icon name="receipt_long" color="primary" size="sm" />
                <div
                  class="text-subtitle2 text-primary"
                  style="font-size: 160%"
                >
                  Pedido #{{ numPedido2 }}
                </div>
              </div>

              <q-separator vertical class="q-mx-sm" />

              <!-- Total de Venta -->
              <div class="row items-center q-gutter-xs total-card q-pa-xs">
                <q-icon name="paid" size="sm" class="text-amber-10" />

                <div
                  class="text-body1 text-amber-10 text-weight-bold"
                  style="font-size: 280%"
                >
                  Total: Q. {{ totalStore.totalGeneral.toFixed(2) }}
                </div>
              </div>
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
    :pedidoId="pedidoStore.idPedidoEnc"
    :onNuevoPedido="nuevoPedido"
  />
  <TablaProductos ref="tablaProductosRef" />
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

const validador = ref(false);
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

const { obtenerClientePorDocumento, refetchMostrarCF, mutateCrearCliente } =
  useClientes();
const {
  mutateCrearPedidoEnc,
  obtenerPedidosPendientes,
  obtenerPedidoPorId,
  mutateAnularPedidoPendiente,
} = usePedidosEnc();

const idPedidoEnc = computed(() => pedidoStore.idPedidoEnc);
const { data: pedidoEnc } = obtenerPedidoPorId(idPedidoEnc);
const numPedido2 = computed(() => pedidoStore.numeroDePedido || 0); // pedido funcional
const focus2 = ref<HTMLInputElement | null>(null);

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

// controla que exista un pedido
watch(idPedidoEnc, (nuevoId) => {
  if (nuevoId && nuevoId > 0) {
    console.log("Pedido actualizado desde query:", {
      total: totalReal.value,
    });
  }
});

// Anular pedido pendiente
const anularPedido = async (pedido) => {
  const confirmado = await showConfirmationInsideModal(
    "Anular Pedido",
    `¿Está seguro que desea anular el pedido #${pedido.NUMERO_DE_PEDIDO}?`
  );

  if (!confirmado) return;

  mutateAnularPedidoPendiente({
    id: pedido.ID_PEDIDO_ENC,
    usuario: userStore.nombreVendedor,
  });
};

// continuar pedido pendiente
const continuarPedido = async (pedido) => {
  const confirmado = await showConfirmationInsideModal(
    "Continuar Pedido",
    `¿Está seguro que desea continuar con el pedido #${pedido.NUMERO_DE_PEDIDO}?`
  );

  if (!confirmado) return;

  cleanAllStores();
  await nextTick();

  await formRef.value?.resetValidation();
  // Enfocar productosTab para continuar
  await productosTabRef.value?.enfocarCodigo();

  // Actualizar el store con el ID del pedido pendiente
  pedidoStore.setPedidoEncabezado(
    pedido.ID_PEDIDO_ENC,
    pedido.NUMERO_DE_PEDIDO
  );

  // set cliente
  clienteStore.setCliente({
    documento: pedido.NIT_A_FACTURAR,
    nombre: pedido.NOMBRE_A_FACTURAR,
    direccion: pedido.DIRECCION_FACTURAR,
    telefono: pedido.TELEFONO_CLIENTE || null, // no viene la info
    email: pedido.EMAIL_CLIENTE || null, // no viene la info
  });

  // Cerrar modal de pendientes
  modalPendientes.value = false;

  // Enfocar productosTab para continuar
  await productosTabRef.value?.enfocarCodigo();
};

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
  focus.value?.focus();
};

onMounted(() => {
  enfocarCodigo();
});

// Actualizar numPedido y Total
watchEffect(() => {
  if (pedidoEnc.value) {
    numPedido.value = pedidoEnc.value.NUMERO_DE_PEDIDO || 0;
    totalReal.value = pedidoEnc.value.TOTAL_GENERAL_PEDIDO || 0;
    console.log("Pedido actualizado desde query:", {
      numero: numPedido.value,
      total: totalReal.value,
    });
  }
});

// sucursal siempre: 1
const { data: pedidosPendientes, isLoading } = obtenerPedidosPendientes(
  1,
  userStore.codigoVendedor
);

const mostrarNumPedido = computed(() => pedidoStore.numeroDePedido || 0);

const abrirModalPedidosPendientes = () => {
  modalPendientes.value = true;
};

//Llenar modal desde esta pagina
const clienteTemp = ref({
  NIT: "",
  NOMBRE: "",
  DIRECCION: "",
  TELEFONO: "",
  CORREO_ELECTRONICO: "",
});

//Limpiar los datos del cliente
const resetCliente = () => {
  clienteTemp.value = {
    NIT: "",
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
    ID_SUCURSAL: 1, // Sera unica
    USUARIO_INGRESO_PEDI: userStore.nombreVendedor.substring(0, 10),
    CODIGO_VENDEDOR: userStore.codigoVendedor,
    CODIGO_DE_CLIENTE: 1021, //
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
        data.NUMERO_DE_PEDIDO
      );

      mostrarCardPedidoCreado.value = true;
      mostrarCardTotal.value = true;

      // notificaccion de creado
      $q.notify({
        type: "success",
        message: `Pedido creado`,
        position: "top",
        color: "green",
        timeout: 2000,
        group: false, // se muestra de inmediato
        progress: false,
      });

      await nextTick();
      productosTabRef.value?.enfocarCodigo();
    },
    onError: (error: any) => {
      showErrorNotification(
        "Error al crear",
        error.message || "No se pudo registrar el pedido"
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

// Nueva ****************************************
const buscarClienteDPINIT2 = async () => {
  //if(validador === false)

  const doc = clienteStore.documento.trim();

  if (!doc) return;
  const tipo = tipoDocumento.value;

  const clienteEncontrado2 = await obtenerClientePorDocumento(doc, tipo);

  if (clienteEncontrado2) {
    clienteStore.setCliente({
      documento: clienteEncontrado2.NIT || "",
      nombre: clienteEncontrado2.NOMBRE || "",
      direccion: clienteEncontrado2.DIRECCION || "",
      telefono: clienteEncontrado2.TELEFONO || "",
      email: clienteEncontrado2.CORREO_ELECTRONICO || "",
    });
  } else {
    // prellenar
    abrirModalCliente.value = true;
    clienteTemp.value.NIT = doc; // prellenar el NIT buscado
    clienteTemp.value.DIRECCION = "Ciudad";
    clienteTemp.value.NIT = doc;
  }
};

// actual ****************************************
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

      showSuccessNotification(
        "Nuevo Cliente",
        "Cliente creado satisfactoriamente"
      );
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
</style>
