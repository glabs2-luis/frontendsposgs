<template>

    <q-card flat bordered class="productos-table-card">
    <q-card-section class="row items-center justify-between">
      <div class="text-h6">Detalle del Pedido #{{ pedidoStore.numeroDePedido }}</div>
      <q-btn icon="refresh" flat dense round @click="refetch()" />
    </q-card-section>

    <q-card-section>

      <q-table
        :rows="rows"
        :columns="columnas"
        row-key="ID_PEDIDO_DET"
        dense
        flat
        bordered
        :loading="isLoading"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- Formateo: precio y subtotal -->
        <template v-slot:body-cell-PRECIO_UNIDAD_VENTA="props">
          <q-td :props="props">
            Q {{ Number(props.row.PRECIO_UNIDAD_VENTA).toFixed(2) }}
          </q-td>

            <q-td key="acciones" :props="props">
                <div class="row q-gutter-xs">
                  <q-btn size="sm" color="negative" icon="delete" round flat
                    @click.stop="eliminarProducto(props.row)" class="delete-btn"
                  >
                    <q-tooltip>Eliminar producto</q-tooltip>
                  </q-btn>
                </div>
                
              </q-td>
          

        </template>

          <template v-slot:no-data>
            <div class="full-width row justify-center items-center text-grey-6 q-pa-xl">
              <div class="text-center">
                <q-icon name="inventory_2" size="48px" class="q-mb-md" />
                <div class="text-h6">No hay productos agregados</div>
                <div class="text-body2">Escanea un código o busca productos en el catálogo</div>
              </div>
            </div>
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
const { ListaDet1, useListaProductosPedidoDet, mutateEliminarPedidoDetID } = usePedidoDet()
const { data, isLoading, refetch } = ListaDet1(idPedidoEnc)

const { obtenerPedidoPorId, obtenerPedido2, refetchPedidoPorId } = usePedidosEnc()

const { data: pedidoData, refetchObtenerPedidoID } = obtenerPedidoPorId(idPedidoEnc)
// refetch
const { data: listaProductosPedido, refetch: refetchListaProductosPedidoDet } = useListaProductosPedidoDet(idPedidoEnc.value)

// procesar filas 
const rows = computed(() => data.value || [])

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
  
]

// variable para usar en tabla
const detallesPedido = ref([])


// actualización cuando cambia el id
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetch()
    // refetchPedido no necesita parámetros porque ya está vinculado al computed idPedidoEnc
  }
})

// respuesta del query 
watchEffect(() => {
  if (data.value) {
    detallesPedido.value = data.value
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
    showSuccessNotification('Producto eliminado', 'El producto fue eliminado correctamente')


    await refetch()
    await nextTick()

    const result = await refetchObtenerPedidoID()
    const nuevoTotal = result?.data?.TOTAL_GENERAL_PEDIDO || 0
    totalStore.setTotal(nuevoTotal)
    console.log('Nuevo total actualizado desde backend:', nuevoTotal)



  } catch (error) {
    console.error('Error eliminando producto:', error)
    showErrorNotification('Error', 'No se pudo eliminar el producto. Intente nuevamente.')
  }
}



</script>

<style scoped>
.text-h6 {
  font-weight: bold;
}
</style>
