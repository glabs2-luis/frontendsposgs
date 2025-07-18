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
        :loading="isLoading"
        :pagination="{ rowsPerPage: 20 }"
        class="elegant-table"
      >
        <!-- Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="table-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="header-cell"
            >
              <div class="header-content justify-center">
                <span class="text-weight-medium">{{ col.label }}</span>
              </div>
            </q-th>
          </q-tr>
        </template>

        <!-- Filas  -->
        <template v-slot:body="props">
          <q-tr :props="props" class="table-row">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="body-cell"
            >

              <!-- Precio formateado -->
              <template v-if="col.name === 'PRECIO_UNIDAD_VENTA'">
                <div class="price-cell column">
                  <template v-if="props.row.PRECIO_PROMOCION && props.row.PRECIO_PROMOCION < props.row.PRECIO_UNIDAD_VENTA">
                    <div class="text-grey text-strike">
                      Q {{ Number(props.row.PRECIO_UNIDAD_VENTA).toFixed(2) }}
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-weight-medium">
                      Q {{ Number(props.row.PRECIO_UNIDAD_VENTA).toFixed(2) }}
                    </div>
                  </template>
                </div>
              </template>

              <!-- Subtotal General -->
              <template v-else-if="col.name === 'SUBTOTAL_GENERAL'">
                <div class="price-cell">
                  <span class="text-weight-medium">
                    <!-- Calculo  manual-->
                  Q {{ (props.row.CANTIDAD_PEDIDA * props.row.PRECIO_UNIDAD_VENTA).toFixed(2) }}
                  </span>
                </div>
              </template>


              <!-- Acciones -->
              <template v-else-if="col.name === 'acciones'">
                <div class="actions-cell">
                  <q-btn 
                    size="sm" 
                    color="negative" 
                    icon="delete" 
                    round 
                    flat
                    @click.stop="eliminarProducto(props.row)" 
                    class="delete-btn"
                  >
                    <q-tooltip>Eliminar producto</q-tooltip>
                  </q-btn>
                </div>
              </template>

              <!-- Otras columnas -->
              <template v-else-if="col.name === 'DESCRIPCION_PROD'"> <!-- negrita -->
                <div class="descripcion-prod">
                  {{ col.value }}
                </div>
              </template>

              <template v-else-if="col.name === 'CANTIDAD_PEDIDA'"> <!--centrar -->
                <div class="align-cantidad">
                  {{ col.value }}
                </div>
              </template>

              <template v-else>
                {{ col.value }}
              </template>

            </q-td>
          </q-tr>
        </template>

        <!-- Estado sin datos -->
        <template v-slot:no-data>
          <div class="no-data-container">
            <div class="no-data-content">
              <q-icon name="inventory_2" size="64px" class="no-data-icon" />
              <div class="text-h6 text-weight-medium q-mb-xs">No hay productos agregados</div>
              <div class="text-body2 text-grey-6">
                Escanea un código o busca productos en el catálogo
              </div>
            </div>
          </div>
        </template>

        <!-- Loading personalizado -->
        <template v-slot:loading>
          <q-inner-loading showing class="custom-loading">
            <q-spinner-dots size="40px" color="primary" />
            <div class="text-body2 text-grey-6 q-mt-sm">Cargando productos...</div>
          </q-inner-loading>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>


<script setup lang="ts">

import { computed, watch, watchEffect, ref } from 'vue';
import { usePedidoDet } from '@/modules/pedidos_det/composables/usePedidosDet'
import { usePedidoStore } from '@/stores/pedido'
import type { QTableColumn } from 'quasar'
import { usePedidosEnc } from '../../pedidos_enc/composables/usePedidosEnc'
import { useTotalStore } from '@/stores/total'
import { showConfirmationDialog, showErrorNotification, showSuccessNotification } from '@/common/helper/notification'
import { nextTick } from 'vue'

const totalStore = useTotalStore()
const pedidoStore = usePedidoStore()
const idPedidoEnc = computed(() => pedidoStore.idPedidoEnc) 
const numero = pedidoStore.idPedidoEnc
const { ListaDet1, ListaDet2, useListaProductosPedidoDet, mutateEliminarPedidoDetID } = usePedidoDet()


const { obtenerPedidoPorId, obtenerPedido2, refetchPedidoPorId } = usePedidosEnc()

const { data: pedidoData, refetchObtenerPedidoID } = obtenerPedidoPorId(idPedidoEnc)


// usando actualmente 
const { data, isLoading, refetch } = ListaDet1(idPedidoEnc)
const { data: data2, refetch: refetch2 } = ListaDet2(idPedidoEnc)
// procesar filas 
const rows = computed(() => data2.value || [])


// calcular total
const idTotal = computed(() => pedidoStore.idPedidoEnc) 

const { data: dataPedido } = obtenerPedidoPorId(idTotal)

const totalGeneral = computed(() => {
  if (!dataPedido.value) return 0
  return Number(dataPedido.value.TOTAL_GENERAL_PEDIDO) || 0
})

// Watch para actualizar el store 
watch(totalGeneral, (nuevoTotal) => {
  totalStore.setTotal(nuevoTotal)
  console.log('Total actualizado:', nuevoTotal)
}, { immediate: true })



const columnas: QTableColumn[] = [
  { name: 'PRODUCT0', label: 'Código', field: 'PRODUCT0', align: 'left' },
  { name: 'DESCRIPCION_PROD', label: 'Descripción', field: 'DESCRIPCION_PROD', align: 'left' },
  { name: 'CANTIDAD_PEDIDA', label: 'Cantidad', field: 'CANTIDAD_PEDIDA', align: 'right' },
  { name: 'PRECIO_UNIDAD_VENTA', label: 'Precio Unitario', field: 'PRECIO_UNIDAD_VENTA', align: 'right' },
  { name: 'SUBTOTAL_GENERAL', label: 'Subtotal', field: 'SUBTOTAL_GENERAL', align: 'right' },
  { name: 'acciones', label: 'Eliminar', field:'', align:'right'}
]

// variable para usar en tabla
const detallesPedido = ref([])


// actualización cuando cambia el id
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetch()

  }
})

// respuesta del query 
watchEffect(() => {
  if (data2.value) {
    detallesPedido.value = data2.value
  }
})


// Eliminar Producto 
const eliminarProducto = async (detalle) => {
  const confirmado = await showConfirmationDialog(
    'Eliminar producto',
    '¿Desea eliminar este producto del pedido?'
  )
  if (!confirmado) return

  try {
    await mutateEliminarPedidoDetID(detalle.ID_PEDIDO_DET)

    await refetch()
    await nextTick()

    const result = await refetchObtenerPedidoID()
    const nuevoTotal = result?.data?.TOTAL_GENERAL_PEDIDO || 0
    totalStore.setTotal(nuevoTotal)
    console.log('Nuevo total actualizado desde backend:', nuevoTotal)

    // mas funciones
  } catch (error) {
    console.error('Error eliminando producto:', error)
    showErrorNotification('Error', 'No se pudo eliminar el producto. Intente nuevamente.')
  }
}


</script>

<style scoped>

.productos-table-card {
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
  padding: 0;
  border-radius: 2px;
}

.elegant-table {
  background: white;
  
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
  content: '';
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
}

.table-row:hover {
  background-color: rgba(25, 118, 210, 0.03);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.body-cell {
  padding: 12px;
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
  width: 100%;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.no-data-content {
  text-align: center;
  max-width: 300px;
}

.no-data-icon {
  color: #9e9e9e;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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
  justify-content: center;
}

.descripcion-prod {
  font-weight: bold;
  font-size: 15px; /* tamaño de descripcion */
  color: #212121;
}


</style>
