<template>
  <q-card flat bordered class="productos-table-card">
    <q-separator />

    <q-card-section class="table-section">
      <q-table
        :rows="rows"
        :columns="columnas"
        row-key="ID_PEDIDO_DET"
        dense
        flat
        :loading="isLoadingQuery || isLoading"
        :pagination="{ rowsPerPage: 50 }"
        class="elegant-table h-full full-height-table"
        table-header-style="background: linear-gradient(135deg, #536103 0%, #6b745b 100%); color: white;"
      >
        <!-- Header -->
        <!--
          Se quito esto ya que era una carga extra para la tabla 
         -->
        <!-- Filas  -->
        <!-- Descripción editable con  (AUX -> PROD) -->
        <template v-slot:body-cell-DESCRIPCION_PROD="props">
            <q-td :props="props" >
              
              {{ descMostrar(props.row) }}
                <q-tooltip anchor="bottom middle" self="bottom middle" transition-show="scale" transition-hide="scale">
                  {{ props.row.DESCRIPCION_PROD_AUX || props.row.DESCRIPCION_PROD }}
                  
                </q-tooltip>
              <!-- Descripción editable -->
                <!-- <div class="descripcion-prod row items-center no-wrap cursor-pointer"> -->
                <q-popup-edit
                  style="width: 500px;"
                  :cover="false"
                  :model-value="props.row.DESCRIPCION_PROD_AUX || props.row.DESCRIPCION_PROD"
                  buttons
                  label-set="Guardar"
                  label-cancel="Cancelar"
                  :disable="savingDescId === props.row.ID_PEDIDO_DET"
                  @save="(val) => onGuardarDescripcion(props.row, val)"
                  v-slot="scope"
                >
                    <q-input
                      type="textarea"
                      v-model="scope.value"
                      clearable

                      dense
                      autofocus
                      counter
                      :maxlength="200"
                      @focus="(e) => (e.target as HTMLInputElement).select()"
                      @keyup.enter.stop="onGuardarDescripcion(props.row, scope.value)"
                    />
                </q-popup-edit>

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



        <!-- Loading -->
        <template v-slot:loading>
          <q-inner-loading showing class="custom-loading">
            <q-spinner-dots color="primary" />
            <div class="text-body2 text-grey-6 q-mt-sm">
              Cargando productos...
            </div>
          </q-inner-loading>
        </template>

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
import { computed, watch, watchEffect, ref } from "vue";
import { useQuasar } from "quasar";
import { usePedidoDet } from "@/modules/pedidos_det/composables/usePedidosDet";
import { usePedidoStore } from "@/stores/pedido";
import type { QTableColumn } from "quasar";
import { usePedidosEnc } from "../../pedidos_enc/composables/usePedidosEnc";
import { useTotalStore } from "@/stores/total";
import {
  showConfirmationDialog,
  showErrorNotification,
} from "@/common/helper/notification";
import { nextTick } from "vue";
import useFormat from "@/common/composables/useFormat";

const { formatCurrency, formatNumber } = useFormat();
const $q = useQuasar();

// Props
const props = defineProps<{
  onProductoEliminado?: () => void;
}>()
const items = ref(0);
const totalStore = useTotalStore();
const pedidoStore = usePedidoStore();
const idPedidoEnc = computed(() => pedidoStore.idPedidoEnc);
const { ListaDet1, useListaProductosPedidoDet, mutateEliminarPedidoDetID, mutateActualizarPedidoDetId } =
  usePedidoDet();
const { data, isLoading: isLoadingQuery, refetch } = ListaDet1(idPedidoEnc);

// Variable local para controlar el loading de eliminación
const isLoading = ref(false);
const { obtenerPedidoPorId, obtenerPedido2, refetchPedidoPorId } =
  usePedidosEnc();
const { data: pedidoData, refetchObtenerPedidoID } =
  obtenerPedidoPorId(idPedidoEnc);
// refetch
const { data: listaProductosPedido, refetch: refetchListaProductosPedidoDet } =
  useListaProductosPedidoDet(idPedidoEnc.value);

// procesar filas
const rows = computed(() => data.value || []);

watchEffect(() => {
 // console.log("Esto es rows:", rows.value);
});

// Almacenar cantidad de items
watchEffect(() => {
  const total = rows.value.reduce((acc, row) => {
    return acc + (row.CANTIDAD_PEDIDA || 0);
  }, 0);
  items.value = total;
  totalStore.setItems(items.value);
  //console.log('Total store items: ', totalStore.totalItems); 
});

// calcular total
const idTotal = computed(() => pedidoStore.idPedidoEnc);

const { data: dataPedido } = obtenerPedidoPorId(idTotal);

const totalGeneral = computed(() => {
  if (!dataPedido.value) return 0;
  return Number(dataPedido.value.TOTAL_GENERAL_PEDIDO) || 0;
});

// Watch para actualizar el store
watch(
  totalGeneral,
  (nuevoTotal) => {
    totalStore.setTotal(nuevoTotal);
    //console.log("Total actualizado:", nuevoTotal);
  },
  { immediate: true }
);

// Mostrar la descripcion del producto o descripcion actualizada
const descMostrar = (row: any) => {
  const aux = (row?.DESCRIPCION_PROD_AUX ?? '').trim();
  return aux.length ? aux : row?.DESCRIPCION_PROD;
};

// Columnas para la tabla
const columnas: QTableColumn[] = [
  { 
    name:"PRODUCT0", 
    label: "Código", 
    field: "PRODUCT0", 
    align: "center" 
  },
  {
    name: "DESCRIPCION_PROD",
    label: "Descripción",
    field: (row) => (row?.DESCRIPCION_PROD_AUX?.trim() || row?.DESCRIPCION_PROD), 
    style: "max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
    align: "left",
  },
  {
    name: "CANTIDAD_PEDIDA",
    label: "Cantidad",
    field: "CANTIDAD_PEDIDA",
    align: "center",
  },
  {
    name: "PRECIO_UNIDAD_VENTA",
    label: "Precio Unitario",
    field: "PRECIO_UNIDAD_VENTA",
    format: (val, row) => formatCurrency(Number(row.PRECIO_UNIDAD_VENTA), 4),
    align: "center",
  },
  {
    name: "SUBTOTAL_GENERAL",
    label: "Subtotal",
    field: "SUBTOTAL_GENERAL",
    format: (val, row) => formatCurrency(row.SUBTOTAL_VENTAS + row.MONTO_IVA, 2),
    align: "center",
  },
  { name: "acciones", label: "Eliminar", field: "", align: "center" },
];

// variable para usar en tabla
const detallesPedido = ref([]);

// Función para forzar actualización de la tabla
const forzarActualizacionTabla = async () => {
  try {
    await refetch();
    await refetchListaProductosPedidoDet();
    await refetchObtenerPedidoID();
    await nextTick();
  } catch (error) {
    console.error("Error forzando actualización:", error);
  }
};

// estado de guardado por fila
const savingDescId = ref<number | null>(null);


const onGuardarDescripcion = (row: any, nuevaDescripcion: string) => {
  const desc = (nuevaDescripcion ?? '').trim();

  if (!desc || desc === descMostrar(row)) return;

    savingDescId.value = row.ID_PEDIDO_DET;
    
 // const updatedRow = { ...row, DESCRIPCION_PROD_AUX: desc, DESCRIPCION_MOSTRAR: desc };

  mutateActualizarPedidoDetId(
    { id: row.ID_PEDIDO_DET, descripcion: desc },
    {
      onSuccess: async () => {
        await forzarActualizacionTabla();        // actualizar Tabla
        $q.notify({ type: 'positive', message: 'Descripción actualizada' })
      },
      onError: (e: any) => {
        const message = e?.message || 'No se pudo actualizar la descripción'
        showErrorNotification('Error', message)
      },
      onSettled: () => {
        savingDescId.value = null
      }
    }
  );
};

// actualización cuando cambia el id
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetch();
  }
});

// respuesta del query
watchEffect(() => {
  if (data.value) {
    detallesPedido.value = data.value;
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
          // console.log("Nuevo total actualizado desde backend:", nuevoTotal);
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
          console.log(
            "Producto eliminado, llamando callback para enfocar input"
          );
          props.onProductoEliminado();
        }
      },
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
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


function emit(arg0: string) {
  throw new Error("Function not implemented.");
}
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
  
  background: white;
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
  font-size: 16px;
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
</style>
