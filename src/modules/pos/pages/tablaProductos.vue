<template>
  <!-- Modal de contraseña para bajar precios -->
  <PasswordModal
    ref="passwordModalRef"
    title="Autorización Requerida"
    label="Clave del encargado"
    @success="onPasswordSuccess"
    @cancel="onPasswordCancel"
  />

  <q-card flat bordered class="productos-table-card">
    <q-separator />

    <!-- FILTRO  -->
    <div class="q-pa-sm bg-grey-1">
      <q-input
        v-model="filtro"
        placeholder="Filtrar por código o descripción..."
        outlined
        dense
        clearable
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- FLOATIN ACTION BUTTONS PARA ASIGAR TAMAÑO DE LETRA Y RECARGAR LOS DETALLES DEL PEDIDO -->
    <q-fab
      color="orange"
      icon="add"
      direction="up"
      class="q-mb-md fixed-bottom-right"
      style="bottom: 30px; right: 30px"
    >
      <q-fab-action
        color="orange"
        @click="forzarActualizacionTabla"
        icon="sync"
      >
        <q-tooltip
          anchor="center left"
          self="bottom middle"
          transition-show="scale"
          transition-hide="scale"
        >
          Actualizar tabla de detalles del pedido actual
        </q-tooltip>
      </q-fab-action>
      <div class="q-pa-sm bg-white q-rounded shadow-2">
        <q-input
          v-model.number="tamanioLetra"
          type="number"
          label="Cantidad"
          dense
          debounce="500"
          outlined
          style="width: 100px"
        >
          <q-tooltip
            anchor="center left"
            self="bottom middle"
            transition-show="scale"
            transition-hide="scale"
          >
            Modificar tamaño de letra
          </q-tooltip>
        </q-input>
      </div>
    </q-fab>
    <q-card-section class="table-section">
      <q-table
        :rows="listaProductosPedido || []"
        :columns="columnas"
        row-key="ID_PEDIDO_DET"
        dense
        flat
        :loading="isLoadingQuery || isLoading"
        :pagination="{ rowsPerPage: 50 }"
        class="elegant-table h-full full-height-table"
        table-header-style="background: linear-gradient(135deg, #536103 0%, #6b745b 100%); color: white;"
        :filter="filtro"
        :filter-method="filtrarProductos"
        style="height: 100%;"
      >
        <!-- Header -->

        <!-- Filas  -->
        <!-- Descripción editable con  (AUX -> PROD) -->
        <template v-slot:body-cell-DESCRIPCION_PROD="props">
          <q-td :props="props" :style="'font-size:' + tamanioLetra + 'px;'">
            {{ descMostrar(props.row) }}
            <q-tooltip
              anchor="bottom middle"
              self="bottom middle"
              transition-show="scale"
              transition-hide="scale"
            >
              Clic para editar la descripción
            </q-tooltip>
            
            <!-- Descripción editable -->
            <!-- <div class="descripcion-prod row items-center no-wrap cursor-pointer"> -->

            <q-popup-edit
              style="width: 500px"
              :cover="false"
              :model-value="
                props.row.DESCRIPCION_PROD_AUX || props.row.DESCRIPCION_PROD
              "
              :disable="savingDescId === props.row.ID_PEDIDO_DET"
              @save="(val) => solicitarAutorizacionDescripcion(props.row, val)"
              v-slot="scope"
            >
              <q-input
                type="text"
                v-model="scope.value"
                clearable
                autogrow
                dense
                autofocus
                counter
                :maxlength="200"
                @focus="selectOnFocus"
                @keyup.enter="() => { solicitarAutorizacionDescripcion(props.row, scope.value); scope.set(); }"
                @keyup.esc="scope.set()"
              />
            </q-popup-edit>
          </q-td>
        </template>
        
        <!-- CANTIDAD PEDIDA -->
        <template v-slot:body-cell-CANTIDAD_PEDIDA="props">
          <q-td
            :props="props"
            :style="'font-size:' + tamanioLetra + 'px;'"
            data-editable="true"
          >
            {{ props.row.CANTIDAD_PEDIDA }}

            <!-- Edición de cantidad -->
            <q-popup-edit
              style="width: 200px"
              :cover="false"
              :model-value="props.row.CANTIDAD_PEDIDA"
              :disable="savingCantidadId === props.row.ID_PEDIDO_DET"
              @save="(val) => onGuardarCantidad(props.row, val)"
              v-slot="scope"
            >
              <q-input
                type="number"
                v-model.number="scope.value"
                clearable
                dense
                autofocus
                min="1"
                step="1"
                label="Cantidad"
                @focus="selectOnFocus"
                @keyup.enter="onGuardarCantidad(props.row, scope.value)"
                @keyup.esc="scope.set()"
              />
            </q-popup-edit>
          </q-td>
        </template>

        <!-- PRECIO UNITARIO -->
        <template v-slot:body-cell-PRECIO_UNIDAD_VENTA="props">
          <q-td
            :props="props"
            :style="'font-size:' + tamanioLetra + 'px;'"
            data-editable="true"
          >
            {{ formatCurrency(Number(props.row.PRECIO_UNIDAD_VENTA), 4) }}
            <q-tooltip
              anchor="bottom middle"
              self="bottom middle"
              transition-show="scale"
              transition-hide="scale"
              class="precio-auth-tooltip"
            >
              <div>
                <div class="text-caption q-mt-xs">
                  ⚠️ Bajar precio requiere autorización
                </div>
              </div>
            </q-tooltip>

            <!-- Edición de precio -->
            <q-popup-edit
              style="width: 200px"
              :cover="false"
              :model-value="props.row.PRECIO_UNIDAD_VENTA"
              :disable="savingPrecioId === props.row.ID_PEDIDO_DET"
              v-slot="scope"
            >
              <q-input
                type="number"
                v-model.number="scope.value"
                clearable
                dense
                autofocus
                min="0"
                step="0.0001"
                label="Precio Unitario"
                prefix="Q"
                @focus="selectOnFocus"
                @keyup.enter="onGuardarPrecio(props.row, scope.value)"
                @keyup.esc="scope.set()"
              />
            </q-popup-edit>
          </q-td>
        </template>
        <!-- SUBTOTAL -->
        <template v-slot:body-cell-SUBTOTAL_GENERAL="props">
          <q-td :props="props" :style="'font-size:' + tamanioLetra + 'px;'">
            {{
              formatCurrency(props.row.SUBTOTAL_VENTAS + props.row.MONTO_IVA, 2)
            }}
          </q-td>
        </template>
        <!-- ELIMINAR PRODUCTO -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              color="negative"
              icon="delete"
              round
              dense
              flat
              class="delete-btn"
              @click.stop="eliminarProducto(props.row)"
            />
          </q-td>
        </template>
        <!-- LOADING -->
        <template v-slot:loading>
          <q-inner-loading showing class="custom-loading">
            <q-spinner-dots color="primary" />
            <div class="text-body2 text-grey-6 q-mt-sm">
              Cargando productos...
            </div>
          </q-inner-loading>
        </template>
        <!-- NO HAY DATOS -->
        <template v-slot:no-data>
          <div
            class="full-width full-height flex flex-center"
            style="min-height: 60vh"
          >
            <div class="column items-center justify-center text-center">
              <q-icon
                name="inventory_2"
                size="64px"
                class="text-grey-6 q-mb-sm"
              />
              <div class="text-h6 text-grey-7">No hay productos agregados</div>
              <div class="text-subtitle2 text-grey-5">
                Escanea un código o busca productos en el catálogo
              </div>
            </div>
          </div>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {
  nextTick,
  computed,
  watch,
  watchEffect,
  ref,
  toRef,
  onMounted,
} from "vue";
import { useQuasar } from "quasar";
import type { QTableColumn } from "quasar";

import { usePedidoDet } from "@/modules/pedidos_det/composables/usePedidosDet";
import { usePedidosEnc } from "../../pedidos_enc/composables/usePedidosEnc";
import { usePedidoStore } from "@/stores/pedido";
import { useTotalStore } from "@/stores/total";
import useFormat from "@/common/composables/useFormat";
import PasswordModal from "@/common/components/PasswordModal.vue";

import {
  showConfirmationDialog,
  showErrorNotification,
  showErrorNotificationInside,
} from "@/common/helper/notification";

// PROPS
interface Props {
  onProductoEliminado?: () => void;
  PedidoId?: number;
}
const props = defineProps<Props>();
const pedidoId = toRef(props, "PedidoId");
const tamanioLetra = ref(16); // Tamaño de letra para la descripción, precio y subtotal
// Para descripción pendiente de autorización
const descPendiente = ref<{ row: any; nuevaDesc: string } | null>(null);

const solicitarAutorizacionDescripcion = (row: any, nuevaDesc: string) => {
  if (!nuevaDesc || nuevaDesc.trim() === descMostrar(row)) return;

  // Guardar pendiente
  descPendiente.value = { row, nuevaDesc: nuevaDesc.trim() };

  // Abrir el modal de contraseña
  passwordModalRef.value?.abrirModal();
};

// Helper to select input content on focus (templates can't use TypeScript assertions)
const selectOnFocus = (e: Event) => {
  const target = e.target as HTMLInputElement | null;
  if (target && typeof (target as any).select === "function") {
    (target as HTMLInputElement).select();
  }
};


// COLUMNAS PARA LA TABLA
const columnas: QTableColumn[] = [
  {
    name: "PRODUCT0",
    label: "Código",
    field: "PRODUCT0",
    align: "center",
    style: "width: 100px; min-width: 100px; max-width: 100px;",
  },
  {
    name: "DESCRIPCION_PROD",
    label: "Descripción",
    field: (row) => row?.DESCRIPCION_PROD_AUX?.trim() || row?.DESCRIPCION_PROD,
    style:
      "max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
    align: "left",
  },
  {
    name: "CANTIDAD_PEDIDA",
    label: "Cantidad",
    field: "CANTIDAD_PEDIDA",
    align: "center",
    style:
      "width: 80px; min-width: 80px; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
  },
  {
    name: "PRECIO_UNIDAD_VENTA",
    label: "Precio Unitario",
    field: "PRECIO_UNIDAD_VENTA",
    format: (val, row) => formatCurrency(Number(row.PRECIO_UNIDAD_VENTA), 4),
    align: "center",
    style: "width: 150px; min-width: 150px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
  },
  {
    name: "SUBTOTAL_GENERAL",
    label: "Subtotal",
    field: "SUBTOTAL_GENERAL",
    format: (val, row) =>
      formatCurrency(row.SUBTOTAL_VENTAS + row.MONTO_IVA, 2),
    align: "center",
    style: "width: 150px; min-width: 150px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
  },
  {
    name: "acciones",
    label: "Eliminar",
    field: "",
    align: "center",
    style: "width: 50px; min-width: 50px; max-width: 50px;",
  },
];

// GENERALES
const $q = useQuasar();
const isLoading = ref(false);
const items = ref(0);
const savingDescId = ref<number | null>(null); // estado de guardado por fila
const savingCantidadId = ref<number | null>(null); // estado de guardado de cantidad
const savingPrecioId = ref<number | null>(null); // estado de guardado de precio
const filtro = ref("");

// Referencias para el modal de contraseña
const passwordModalRef = ref();
const precioPendiente = ref<{ row: any; nuevoPrecio: number } | null>(null);

// COMPOSABLES FUNCTIONS
const totalStore = useTotalStore();
const pedidoStore = usePedidoStore();
const { formatCurrency } = useFormat();
const {
  useListaProductosPedidoDet,
  mutateEliminarPedidoDetID,
  mutateActualizarPedidoDetId,
  mutateActualizarCantidadPedidoDetID,
  mutateActualizarPrecioPedidoDetID,
} = usePedidoDet();
const { obtenerPedidoPorId } = usePedidosEnc();

// USE COMPOSABLES
const {
  data: listaProductosPedido,
  refetch: refetchListaProductosPedidoDet,
  isLoading: isLoadingQuery,
} = useListaProductosPedidoDet(pedidoId);
const { data: pedidoData, refetchObtenerPedidoID } =
  obtenerPedidoPorId(pedidoId);

// Filtro de productos
const filtrarProductos = (rows: any[], terms: string) => {
  if (!terms) return rows;

  const palabras = terms
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  return rows.filter((row) => {
    const codigo = (row.PRODUCT0 || "").toString().toLowerCase();
    const descripcion = (
      row.DESCRIPCION_PROD_AUX ||
      row.DESCRIPCION_PROD ||
      ""
    ).toLowerCase();
    const textoCompleto = codigo + " " + descripcion;

    return palabras.every((palabra) => textoCompleto.includes(palabra));
  });
};

// Computed para el total general del pedido

const totalGeneral = computed(() => {
  if (!pedidoData.value) return 0;
  return Number(pedidoData.value.TOTAL_GENERAL_PEDIDO) || 0;
});

// WATCHS Y WATCH EFFECTS

// Watch para actualizar el tamaño de letra en la tabla
watch(tamanioLetra, (nuevoTamanio) => {
  if (nuevoTamanio < 8 || nuevoTamanio > 60) {

    showErrorNotificationInside("Error", "El tamaño de letra debe estar entre 8 y 60");
    // $q.notify({
    //   type: "negative",
    //   message: "El tamaño de letra debe estar entre 8 y 60",
    // });
    if (nuevoTamanio < 8) tamanioLetra.value = 8;
    if (nuevoTamanio > 60) tamanioLetra.value = 60
    return;
  }
  // Actualizar el tamaño de letra en el store o en la tabla si es necesario
  localStorage.setItem("tamanioLetra", nuevoTamanio.toString());
});

// Watch para actualizar el store del total general
watch(
  totalGeneral,
  (nuevoTotal) => {
    totalStore.setTotal(nuevoTotal);
    //console.log("Total actualizado:", nuevoTotal);
  },
  { immediate: true }
);

// actualización cuando cambia el id
watch(pedidoId, async (nuevo, anterior) => {
  if (nuevo && nuevo > 0) {
    await forzarActualizacionTabla();
  }
});

// Watch para actualizar total cuando cambian los datos del pedido
watch(
  pedidoData,
  (nuevoPedido) => {
    if (nuevoPedido) {
      const nuevoTotal = Number(nuevoPedido.TOTAL_GENERAL_PEDIDO) || 0;
      totalStore.setTotal(nuevoTotal);
      //console.log("Total actualizado desde watch pedidoData:", nuevoTotal);
    }
  },
  { immediate: true }
);

// Almacenar cantidad de items
watchEffect(() => {
  if (!listaProductosPedido.value) return;
  if (listaProductosPedido.value.length === 0) {
    items.value = 0;
    totalStore.setItems(0);
    return;
  }
  const total = listaProductosPedido.value.reduce((acc, row) => {
    return acc + (row.CANTIDAD_PEDIDA || 0);
  }, 0);
  items.value = total;
  totalStore.setItems(items.value);
});

// Mostrar la descripcion del producto o descripcion actualizada
const descMostrar = (row: any) => {
  const aux = (row?.DESCRIPCION_PROD_AUX ?? "").trim();
  return aux.length ? aux : row?.DESCRIPCION_PROD;
};

// Función para forzar actualización de la tabla
const forzarActualizacionTabla = async () => {
  try {
    await refetchListaProductosPedidoDet();
    await refetchObtenerPedidoID();
    await nextTick();
  } catch (error) {
    //console.error("Error forzando actualización:", error);
  }
};

const onGuardarDescripcion = (row: any, nuevaDescripcion: string) => {
  const desc = (nuevaDescripcion ?? "").trim();

  if (!desc || desc === descMostrar(row)) return;

  savingDescId.value = row.ID_PEDIDO_DET;

  // const updatedRow = { ...row, DESCRIPCION_PROD_AUX: desc, DESCRIPCION_MOSTRAR: desc };

  mutateActualizarPedidoDetId(
    { id: row.ID_PEDIDO_DET, descripcion: desc },
    {
      onSuccess: async () => {
        await forzarActualizacionTabla(); // actualizar Tabla
        $q.notify({ type: "positive", message: "Descripción actualizada" });
      },
      onError: (e: any) => {
        const message = e?.message || "No se pudo actualizar la descripción";
        showErrorNotification("Error", message);
      },
      onSettled: () => {
        savingDescId.value = null;
      },
    }
  );
};

// Función para guardar cantidad
const onGuardarCantidad = (row: any, nuevaCantidad: number) => {
  if (!nuevaCantidad || nuevaCantidad <= 0) {
    showErrorNotification("Error", "La cantidad debe ser mayor a 0");
    return;
  }

  if (nuevaCantidad === row.CANTIDAD_PEDIDA) return;

  savingCantidadId.value = row.ID_PEDIDO_DET;

  mutateActualizarCantidadPedidoDetID(
    { id: row.ID_PEDIDO_DET, cantidad: nuevaCantidad },
    {
      onSuccess: async () => {
        await forzarActualizacionTabla();
        $q.notify({ type: "positive", message: "Cantidad actualizada" });
        filtro.value = "";
      },
      onError: (e: any) => {
        const message = e?.message || "No se pudo actualizar la cantidad";
        showErrorNotificationInside("Error", message);
      },
      onSettled: () => {
        savingCantidadId.value = null;
      },
    }
  );
};

// Función para guardar precio
const onGuardarPrecio = (row: any, nuevoPrecio: number) => {
  if (!nuevoPrecio || nuevoPrecio < 0) {
    showErrorNotification("Error", "El precio debe ser mayor o igual a 0");
    return;
  }

  if (nuevoPrecio === row.PRECIO_UNIDAD_VENTA) return;

  // Verificar si el nuevo precio es menor al actual
  if (nuevoPrecio < row.PRECIO_UNIDAD_VENTA) {
    // Guardar el precio pendiente y abrir modal de contraseña
    precioPendiente.value = { row, nuevoPrecio };
    passwordModalRef.value?.abrirModal();
    return;
  }

  // Si el precio es mayor o igual, proceder normalmente
  guardarPrecio(row, nuevoPrecio);
};

// Función para guardar precio después de autorización
const guardarPrecio = (row: any, nuevoPrecio: number) => {
  savingPrecioId.value = row.ID_PEDIDO_DET;

  mutateActualizarPrecioPedidoDetID(
    { id: row.ID_PEDIDO_DET, precio: nuevoPrecio },
    {
      onSuccess: async (data) => {
        await forzarActualizacionTabla();
        $q.notify({ type: "positive", message: "Precio actualizado" });
        filtro.value = "";
      },
      onError: (e: Error) => {
        const message = e?.message || "No se pudo actualizar el precio";
        showErrorNotification("Error", message);
      },
      onSettled: () => {
        savingPrecioId.value = null;
      },
    }
  );
};

// Función cuando se autoriza la contraseña
const onPasswordSuccess = () => {
  if (precioPendiente.value) {
    const { row, nuevoPrecio } = precioPendiente.value;
    guardarPrecio(row, nuevoPrecio);
    precioPendiente.value = null;
  }

    // Caso 2: descripción pendiente
  if (descPendiente.value) {
    const { row, nuevaDesc } = descPendiente.value;
    onGuardarDescripcion(row, nuevaDesc);
    descPendiente.value = null;
    return;
  }
};

// Función cuando se cancela la contraseña
const onPasswordCancel = () => {
  precioPendiente.value = null;
  descPendiente.value = null;
};

// Eliminar Producto
const eliminarProducto = async (detalle) => {
  const confirmado = await showConfirmationDialog(
    "Eliminar producto",
    "¿Desea eliminar este producto del pedido?"
  );
  if (!confirmado) return;

  try {
    // Mostrar loading en la tabla
    isLoading.value = true;

    // Ejecutar la eliminación
    mutateEliminarPedidoDetID(detalle.ID_PEDIDO_DET, {
      onSuccess: () => {
        // Forzar actualización completa de la tabla y datos relacionados
        forzarActualizacionTabla();
        // Actualizar el total en el store
        if (pedidoData.value) {
          const nuevoTotal = Number(pedidoData.value.TOTAL_GENERAL_PEDIDO) || 0;
          totalStore.setTotal(nuevoTotal);
        }

        // Mostrar notificación de éxito
        $q.notify({
          type: "positive",
          message: "Producto eliminado correctamente",
          position: "top",
          timeout: 2000,
        });

        // Llamar al callback para mover el foco al input de código
        if (props.onProductoEliminado) {
          props.onProductoEliminado();
        }
      },
    });
  } catch (error) {
    showErrorNotification(
      "Error",
      "No se pudo eliminar el producto. Intente nuevamente."
    );
  } finally {
    // Ocultar loading
    isLoading.value = false;
  }
};

// Exponer funciones al componente padre
defineExpose({
  forzarActualizacionTabla,
  eliminarProducto,
});

// LIFE CYCLE HOOKS
// Cargar el tamaño de letra desde localStorage al montar el componente

onMounted(() => {
  // Cargar el tamaño de letra desde localStorage si existe
  const tamanio = localStorage.getItem("tamanioLetra");
  if (tamanio) {
    tamanioLetra.value = parseInt(tamanio, 10);
  } else {
    tamanioLetra.value = 28; // Valor por defecto
  }
});
</script>

<style scoped>
.productos-table-card {
  height: 100vh;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 6px 0 0 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  margin: 0% auto;
  font-size: 14px; /* tamaño de los headers */
}

.order-info {
  display: flex;
  align-items: center;
}

.refresh-btn {
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: rotate(180deg);
  background-color: rgba(25, 118, 210, 0.1);
}

.table-section {
  height: calc(100vh - 60px);
  padding: 0;
  border-radius: 2px;
}

.full-height-table {
  height: auto;
}

.elegant-table {
  background: rgb(255, 255, 255);
  border-radius: 0%;
  /* justify-items: center;
  justify-content: center; */
}

.table-header {
  background: linear-gradient(135deg, #536103 0%, #6b745b 100%);
  color: rgb(255, 255, 255);
}

.header-cell {
  padding: 16px 12px;
  border-bottom: none;
  position: relative;
}

.header-cell:not(:last-child)::after {
  content: "";
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-row {
  transition: all 0.2s ease;
  /* font-size: 16px; */
}

.table-row:hover {
  background-color: rgba(25, 118, 210, 0.03);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.body-cell {
  font-size: 16px; /* tamaño de la letra */
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.price-cell {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #010a01;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.delete-btn {
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: rgba(244, 67, 54, 0.1);
  transform: scale(1.1);
}

.no-data-container {
  height: 100%;
  width: 100%;
  padding: 20px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.no-data-content {
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  max-width: 300px;
  color: #555;
  font-size: 15px;
}

.no-data-icon {
  color: #9e9e9e;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.custom-loading {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

/* Responsive */
@media (max-width: 768px) {
  .card-header {
    padding: 16px 20px;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .body-cell {
    padding: 8px;
  }

  .no-data-container {
    padding: 40px 20px;
    min-height: 200px;
  }
}

/* Animaciones adicionales */
.productos-table-card {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scroll suave en la tabla */
.q-table__container {
  border-radius: 0 0 12px 12px;
}

/* Estilo para el paginador */
.q-table__bottom {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  background: #fafafa;
  padding: 12px 16px;
}

.text-strike {
  text-decoration: line-through;
}

.rounded-borders {
  border-radius: 6px;
}

.align-cantidad {
  display: flex;
  font-size: 18px;
  justify-content: center;
}

.descripcion-prod {
  font-weight: bold;
  font-size: 16px; /* tamaño de descripcion */
  color: #212121;
}

/* Estilos para campos editables */
.q-popup-edit {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.q-popup-edit .q-input {
  border-radius: 6px;
}

.q-popup-edit .q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* Indicador visual para campos editables */
.q-td[data-editable="true"] {
  cursor: pointer;
  transition: all 0.2s ease;
}

.q-td[data-editable="true"]:hover {
  background-color: rgba(25, 118, 210, 0.05);
  border-radius: 4px;
}

/* Loading states para campos editables */
.q-popup-edit--loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Estilos para inputs con Enter habilitado */
.q-popup-edit .q-input {
  transition: all 0.2s ease;
}

.q-popup-edit .q-input:focus-within {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

/* Indicador visual para Enter */
.q-popup-edit .q-input::after {
  content: "Enter para guardar";
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 10px;
  color: #666;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.q-popup-edit .q-input:focus-within::after {
  opacity: 1;
}

/* Estilos para precios que requieren autorización */
.q-td[data-editable="true"] .precio-requiere-auth {
  color: #ff6b35;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* Tooltip para precios que requieren autorización */
.precio-auth-tooltip {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 12px;
}
</style>
