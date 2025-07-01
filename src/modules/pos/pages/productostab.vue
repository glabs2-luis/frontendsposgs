<template>
  <div class="pedido-detalle-container">

<q-card flat bordered class="q-pa-md q-mb-md bg-yellow-1 text-black rounded-borders shadow-2">

  <!-- título + total -->
  <div class="row items-center justify-between q-mb-md">

    <!-- Título -->
    <div class="col-auto row items-center q-gutter-sm">
      <q-icon name="receipt_long" size="24px" color="black" />
      <div>
        <div class="text-subtitle2 text-weight-bold text-dark">
          Detalle del Pedido #{{ pedidoId }}
        </div>
        <div class="text-caption text-grey-8">
          Registra productos escaneando o ingresando manualmente
        </div>
      </div>
    </div>

    <!-- Terminar Venta-->

    <q-btn label="Terminar Venta" icon="point_of_sale" @click="" class="boton-amarillo q-ml-auto" />




    <!-- Total -->
    <div class="col-auto">
      <q-badge color="positive" text-color="white" class="q-pa-sm q-ml-md" style="min-width: 110px; border-radius: 8px;">
        <div class="text-subtitle2">Q  {{ totalPedido.toFixed(2) }}</div>
      </q-badge>
    </div>
  </div>

  <!-- Segunda fila: inputs + botones -->
  <div class="row q-col-gutter-sm items-end">
    <!-- Código del producto -->
    <q-input
      v-model="codigoProducto"
      label="Código del Producto"
      outlined
      dense
      @keyup.enter="buscarProductoPorCodigo"
      @input="onCodigoChange"
      class="col-12 col-md-5">
    
      <template #prepend>
        <q-icon name="view_headline" color="primary" />
      </template>
      <template #append>
        <q-btn round dense flat icon="search" @click="buscarProductoPorCodigo" color="primary" />
      </template>
    </q-input>

    <!-- Cantidad -->
    <q-input
      v-model.number="cantidad"
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
        @click="agregarProducto"
        color="primary"
        icon="add"
        label="Agregar"
        class="col"
        :loading="loadingAgregar"
        :disable="!codigoProducto"/>
      
      <q-btn
        @click="abrirCatalogo"
        color="secondary"
        icon="inventory_2"
        label="Catálogo"
        class="col"
        outline/>
      
    </div>
  </div>

</q-card>


    <!-- Tabla de productos -->
    <q-card flat bordered class="productos-table-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="detallesPedido"
          :columns="columns"
          row-key="ID_PEDIDO_DET"
          flat
          :loading="loadingDetalle"
          :pagination="{ rowsPerPage: 50 }"
          class="productos-table" >
        
          <template v-slot:body="props">
            <q-tr :props="props" class="producto-row">
              <q-td key="codigo" :props="props">
                <div class="text-weight-medium"> {{ props.row.PRODUCT0 }}</div>
              </q-td>
              
              <q-td key="producto" :props="props">
                <div class="producto-info">
                  <div class="text-caption text-grey-9 text-weight bold" v-if="props.row.DESCRIPCION_PROD_AUX">
                    {{ props.row.DESCRIPCION_PROD_AUX }}
                  </div>
                </div>
              </q-td>
              
              <q-td key="cantidad" :props="props">
                <q-input
                  v-model.number="props.row.CANTIDAD_PEDIDA"
                  type="number"
                  dense
                  outlined
                  min="1"
                  @change="actualizarCantidad(props.row)"
                  class="cantidad-edit"
                  style="width: 80px"
                />
              </q-td>
              
              <q-td key="precio" :props="props">
                <div class="precio-info">
                  <div class="text-weight-medium">Q  {{ props.row.PRECIO_UNITARIO_VENTA.toFixed(4) }}</div>
                  <div class="text-caption text-grey-6" v-if="props.row.PRECIO_AFECTADO !== props.row.PRECIO_UNITARIO_VENTA">
                    Afectado: Q{{ props.row.PRECIO_AFECTADO.toFixed(2) }}
                  </div>
                </div>
              </q-td>
              
              <q-td key="subtotal" :props="props">
                <div class="text-weight-bold text-primary">
                  Q  {{ props.row.SUBTOTAL_VENTAS.toFixed(2) }}
                </div>
              </q-td>
              
              <q-td key="acciones" :props="props">
                <div class="row q-gutter-xs">
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
              </q-td>
            </q-tr>
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

<!-- Modal de catálogo de productos -->
<q-dialog v-model="modalProductos" maximized>
  <q-card class="catalogo-modal">

    <!-- Título y botón cerrar -->
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Catálogo de Productos</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <!-- Buscador -->
    <q-card-section>
      <q-input
        v-model="filtroProductos"
        label="Buscar productos..."
        outlined
        dense
        @input="filtrarProductos"
        class="q-mb-md"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-btn
            v-if="filtroProductos"
            @click="limpiarFiltro"
            icon="clear"
            flat
            round
            dense
          />
        </template>
      </q-input>

      <!-- Tabla de productos -->
      <q-table
        :rows="productosFiltrados"
        :columns="columnasCatalogo"
        row-key="PRODUCTO"
        :loading="loadingProductos"
        :pagination="paginacionCatalogo"
        class="catalogo-table"
        :body-cell="() => {}"
      >
        <template #body="props">
          <q-tr :props="props" class="catalogo-row" @click="seleccionarProducto(props.row)">
            
            <!-- Código del producto -->
            <q-td key="codigo">
              <div class="text-weight-medium">{{ props.row.PRODUCT0 }}</div>
            </q-td>

            <!-- Descripción del producto y mensaje -->
            <q-td key="producto">
              <div class="producto-catalogo">
                <div class="text-weight-bold">{{ props.row.DESCRIPCION_PROD }}</div>
              </div>
            </q-td>

            <!-- Marca -->
            <q-td key="marca">
              <q-chip size="sm" color="grey-3" text-color="dark">
                {{ props.row.DESCRIPCION_MARCA }}
              </q-chip>
            </q-td>

            <!-- Precio final -->
            <q-td key="precio">
              <div class="text-weight-bold text-primary ">
                Q {{ props.row.PRECIO_FINAL.toFixed(2) }}
              </div>
            </q-td>


            <!-- Precio Oferta -->
            <q-td key="precioOferta">
              <div v-if="props.row.MENSAJE === 'Precio en promocion'">
                <span class="text-red text-strike q-mr-sm">
                  Q {{ props.row.PRECIO_FINAL.toFixed(2) }}
                </span>
                <span class="text-green text-bold">
                 Q {{ props.row.PRECIO_PROMOCION != null ? props.row.PRECIO_PROMOCION.toFixed(4) : '0.00' }}
                </span>
              </div>
              </q-td>
        

            <!-- Acción: botón agregar -->
            <q-td key="accion">
              <q-btn
                color="primary"
                icon="add_shopping_cart"
                size="sm"
                round
                @click.stop="seleccionarProducto(props.row)"
              >
                <q-tooltip>Agregar al pedido</q-tooltip>
              </q-btn>
            </q-td>

          </q-tr>
        </template>



      </q-table>





    </q-card-section>

  </q-card>
</q-dialog>


  </div>
</template>

<script setup>

import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useProductos } from '@/modules/Productos/composables/useProductos'
import { usePedidoDet } from '@/modules/pedidos_det/composables/usePedidosDet'
import { showConfirmationDialog, showSuccessNotification } from '@/common/helper/notification'

const props = defineProps({
  pedidoId: {
    type: String,
    required: true
  }
})

const { mutateCrearPedidoDet, obtenerPedidosDetID, mutateActualizarPedidoDetId, mutateEliminarPedidoDetID} = usePedidoDet()
const { todosProductos, refetchTodosProductos, obtenerProductosId } = useProductos()

const $q = useQuasar()

// Estados reactivos
const detallesPedido = ref([])
const codigoProducto = ref('')
const cantidad = ref(1)
const modalProductos = ref(false)
const filtroProductos = ref('')
const loadingProductos = ref(false)
const loadingDetalle = ref(false)
const loadingAgregar = ref(false)

//filtro 
const productosFil = computed(() => {
  if (!filtroProductos.value) return todosProductos.value

  const f = filtroProductos.value.toLowerCase()
  return todosProductos.value.filter(prod =>
    prod.PRODUCT0.toLowerCase().includes(f) ||
    prod.DESCRIPCION_MARCA.toLowerCase().includes(f) ||
    (prod.DESCRIPCION_PROD || '').toLowerCase().includes(f)
  )
})

// productos modal
watch(modalProductos, async (val) => {
  if (val) {
    try {
      loadingProductos.value = true
      await refetchTodosProductos()
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al cargar productos' })
    } finally {
      loadingProductos.value = false
    }
  }
})

const abrirCatalogo = () => {
  modalProductos.value = true
}


// Columnas de la tabla principal
const columns = [
  {
    name: 'codigo',
    label: 'Código',
    align: 'left',
    field: 'PRODUCT0',
    sortable: true
  },
  {
    name: 'producto',
    label: 'Producto',
    align: 'left',
    field: 'PRODUCTO',
    sortable: true
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'center',
    field: 'CANTIDAD_PEDIDA',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio Unit.',
    align: 'right',
    field: 'PRECIO_UNITARIO_VENTA',
    sortable: true
  },
  {
    name: 'subtotal',
    label: 'Subtotal',
    align: 'right',
    field: 'PRECIO_FINAL',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    align: 'center'
  }
]

// Columnas del catálogo
const columnasCatalogo = [
  {
    name: 'codigo',
    label: 'Código',
    align: 'left',
    field: 'PRODUCT0',
    sortable: true
  },
  {
    name: 'producto',
    label: 'Producto',
    align: 'left',
    field: 'PRODUCTO',
    sortable: true
  },
  {
    name: 'marca',
    label: 'Marca',
    align: 'left',
    field: 'DESCRIPCION_MARCA',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio',
    align: 'center',
    field: 'PRECIO_FINAL',
    sortable: true
  },
  {
    name: 'precioPromo',
    label: 'Precio Oferta',
    align: 'center',
    field: 'PRECIO_PROMOCION'
  },
  {
    name: 'accion',
    label: 'Acción',
    align: 'center'
  }
]

// Paginación del catálogo
const paginacionCatalogo = ref({
  sortBy: 'PRODUCTO',
  descending: false,
  page: 1,
  rowsPerPage: 100
})



// Computeds
 const totalPedido = computed(() => {
  return detallesPedido.value.reduce((total, item) => total + item.PRECIO_FINAL, 0)
})

defineExpose({
  totalPedido
})




const productosFiltrados = computed(() => {
  if (!filtroProductos.value) return todosProductos.value
  const f = filtroProductos.value.toLowerCase()
  return todosProductos.value.filter(p =>
    p.PRODUCT0.toLowerCase().includes(f) ||
    p.DESCRIPCION_MARCA.toLowerCase().includes(f) ||
    (p.DESCRIPCION_PROD || '').toLowerCase().includes(f)
  )
})

const limpiarFiltro = () => {
  filtroProductos.value = ''
}

const filtrarProductos = () => {

}




const buscarProductoPorCodigo = async () => {
  if (!codigoProducto.value.trim()) return
  
  try {
    loadingAgregar.value = true
    // const producto = await obtenerProductosId(codigoProducto.value)
    
    // Simulación
    const producto = productosDisponibles.value.find(p => 
      p.CODIGO_MARCA === codigoProducto.value
    )
    
    if (producto) {
      await agregarProductoAlPedido(producto)
    } else {
      $q.notify({
        type: 'warning',
        message: 'Producto no encontrado'
      })
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al buscar el producto'
    })
  } finally {
    loadingAgregar.value = false
  }
}

const agregarProducto = () => {
  if (codigoProducto.value.trim()) {
    buscarProductoPorCodigo()
  }
}

const agregarProductoAlPedido = async (producto) => {
  try {
    // Validación mínima de producto y cantidad
    if (!producto || !producto.PRODUCT0 || cantidad.value <= 0) {
      console.error('Producto inválido o cantidad no válida')
      return
    }

    const detalle = {
      ID_PEDIDO_ENC: props.pedidoId,
      ID_PEDIDO_DET: `${props.pedidoId}-${Date.now()}`,
      ID_SUCURSAL: '1',
      NUMERO_DE_PEDIDO: parseInt(props.pedidoId),
      PRODUCT0: producto.PRODUCT0,
      CODIGO_UNIDAD_VENTA: producto.DESCRIPCION_MARCA,
      CANTIDAD_PEDIDA: cantidad.value,
      PRECIO_UNITARIO_VENTA: producto.PRECIO_FINAL,
      PRECIO_AFECTADO: producto.PRECIO_FINAL,
      MONTO_DESCUENTO_PDET: 0,
      MONTO_IVA: 0,
      SUBTOTAL_VENTAS: cantidad.value * producto.COSTO_UNITARIO,
      CORRELATIVO_INGRESO: detallesPedido.value.length + 1,
      DESCRIPCION_PROD_AUX: producto.DESCRIPCION_PROD
    }

    // Agregar detalle al arreglo reactivo de productos
    detallesPedido.value.push(detalle)

    // Limpiar campos del formulario
    codigoProducto.value = ''
    cantidad.value = 1
  } catch (error) {
    console.error('Error al agregar producto al pedido:', error)
  }
}
const seleccionarProducto = (producto) => {
  agregarProductoAlPedido(producto)
  modalProductos.value = false
}

const actualizarCantidad = async (detalle) => {
  try {
    detalle.SUBTOTAL_VENTAS = detalle.CANTIDAD_PEDIDA * detalle.PRECIO_UNITARIO_VENTA
    
    // await mutateActualizarPedidoDetId(detalle)
    
    $q.notify({
      type: 'positive',
      message: 'Cantidad actualizada'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar la cantidad'
    })
  }
}


//eliminar producto
const eliminarProducto = async (detalle) => {
  const confirmado = await showConfirmationDialog('Eliminar producto', '¿Desea eliminar este producto?');
  if (!confirmado) return;

  const index = detallesPedido.value.findIndex(d => d.ID_PEDIDO_DET === detalle.ID_PEDIDO_DET);
  if (index !== -1) {
    detallesPedido.value.splice(index, 1);
    showSuccessNotification('Producto eliminado', 'El producto se ha eliminado correctamente');
  } else {
    showErrorNotification('Error', 'Producto no encontrado en la lista');
  }
}



// Watchers
watch(() => props.pedidoId, () => {
  cargarDetallesPedido()

})

</script>

<style scoped>
.pedido-detalle-container {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.pedido-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  margin-bottom: 16px;
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
  max-width: 250px;
  font-weight: bold;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
  
}

.boton-amarillo {
  background: linear-gradient(90deg, #FFEB3B, #FBC02D);
  color: #070606;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.boton-amarillo:hover {
  background: linear-gradient(90deg, #FBC02D, #F9A825);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}


#oferta
.text-strike {
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

/* Mejoras visuales para la tabla */
.q-table tbody td {
  padding: 12px 16px;
}

.q-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}
</style>