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
          Detalle del Pedido 
        </div>
        <div class="text-caption text-grey-8">
          Registra productos escaneando o ingresando manualmente
        </div>
      </div>
    </div>

    <!-- Terminar Venta-->
    <q-btn label="Terminar Venta (F4)" icon="point_of_sale" @click="terminarVenta" class="boton-amarillo q-ml-auto" />


  </div>

  <!-- Segunda fila: inputs + botones -->
  <div class="row q-col-gutter-sm items-end">

    <!-- Código del producto -->
    <q-input ref="inputCodigo" v-model="codigoProducto" label="Código del Producto" outlined dense @keyup.enter="buscarProductoEscaneado" class="col-12 col-md-5">
    
      <template #prepend>
        <q-icon name="view_headline" color="primary" />
      </template>
      <template #append>
        <q-btn round dense flat icon="search"  color="primary" />
      </template>
    </q-input>

    <!-- Cantidad -->
    <q-input v-model.number="cantidad" label="Cantidad" type="number" outlined dense min="1" class="col-6 col-md-2"
    />

    <!-- Botones -->
    <div class="col-6 col-md-5 row q-gutter-sm">
      <q-btn @click="agregarProducto" color="primary" icon="add" label="Agregar" class="col" :loading="loadingAgregar" :disable="!codigoProducto"/>
      
      <q-btn @click="abrirCatalogo" color="secondary" icon="inventory_2" label="Catálogo" class="col" outline/>
    </div>

  </div>

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
      <q-input v-model="filtroProductos" label="Buscar productos..." outlined dense class="q-mb-md"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #append>
          <q-btn v-if="filtroProductos" @click="limpiarFiltro" icon="clear" flat  round dense
          />
        </template>
      </q-input>

      <!-- Tabla de productos -->
      <q-table
        :rows="productosFil"
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
              <q-chip size="sm" color="yellow" text-color="dark">
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
            <q-td key="accion"> <q-btn color="black" icon="add_shopping_cart" size="sm" round @click.stop="seleccionarProducto(props.row)"
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


  <!-- Modal Para Facturacion -->
  <q-dialog v-model="modalFacturacion" persistent transition-show="fade" transition-hide="fade">
    <q-card class="q-dialog-plugin q-pa-md" style="min-width: 800px; max-width: 90vw; max-height: 90vh">

      <!-- header-->
       <q-card-section class="row items-center justify-between">
        <div class="text-h6 text-primary">Facturación</div>
        <q-btn icon="close" flat round dense v-close-popup />
       </q-card-section > 
        
       <q-separator />

       <q-card-section class="scroll q-pt-sm" style="max-height: 65vh">
        <div class="text-subtitle2 text-gray-8">Pedido # {{ pedidoStore.numeroDePedido }} </div>
        </q-card-section>

          <!-- Mostrar info cliente-->
        <q-card-section>
        <q-card class="q-mb-md bg-grey-1">
        <q-card-section class="q-pa-sm row q-col-gutter-sm items-start">
          <div class="col-auto">
            <q-icon name="person" size="36px" color="primary" />
          </div>
          <div class="col">
            <div class="text-subtitle2 text-weight-bold text-primary">
               {{ pedidoData.NOMBRE_A_FACTURAR  }}
            </div>
            <div class="text-body2 text-grey-8">
              Documento: <strong>{{ pedidoData.NIT_A_FACTURAR }}</strong>
            </div>
            <div class="text-body2 text-grey-8">
              Dirección: <strong>{{ pedidoData.DIRECCION_FACTURAR }}</strong>
            </div>
          </div>
        </q-card-section>
      </q-card>
        
          <!-- Lista de productos -->
      <q-markup-table dense flat bordered class="q-mb-md">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody v-if="!cargandoProductosFactura && productosFactura">
          <tr v-for="item in productosFactura" :key="item.ID_PEDIDO_DET">
            <td>{{ item.PRODUCT0 }}</td>
            <td>{{ item.DESCRIPCION_PROD }}</td>
            <td class="text-right">{{ item.CANTIDAD_PEDIDA }}</td>
            <td class="text-right">Q {{ Number(item.PRECIO_UNIDAD_VENTA).toFixed(2) }}</td>
            <td class="text-right">Q {{ Number(item.SUBTOTAL_VENTAS).toFixed(2) }}</td>
          </tr>
        </tbody>
          <tbody v-else>
          <tr>
            <td colspan="5" class="text-center text-grey-6 q-pa-md">
              <q-spinner-dots color="primary" size="20px" v-if="cargandoProductosFactura" />
              <span v-else>No hay productos en este pedido</span>
            </td>
          </tr>
        </tbody>

      </q-markup-table>

           <!-- Totales -->
      <div class="row justify-end q-gutter-sm text-right text-subtitle2">
        <div class="col-12 col-md-4">
          <div>Subtotal: <strong>Q {{ pedidoData.TOTAL_GENERAL_PEDIDO }}</strong></div>
          <div>Descuento: <strong> {{ pedidoData.MONTO_DESCUENTO_PEDI }}</strong></div>
          <div class="text-weight-bold text-primary"><strong> Total: Q {{ pedidoData.TOTAL_GENERAL_PEDIDO - pedidoData.MONTO_DESCUENTO_PEDI }}</strong></div>
        </div>
      </div>

    </q-card-section>

      <!-- Acciones -->
    <q-card-actions align="right">
      <q-btn flat label="Cancelar" v-close-popup />
      <q-btn icon="taskalt" label="Confirmar Factura" class="boton-amarillo q-ml-auto" @click="confirmarFactura"  />
    </q-card-actions>
       
    </q-card>
  </q-dialog>


  </div>
</template>

<script setup >

import { useQuasar } from 'quasar'
import { ref, computed, onMounted, watch, watchEffect, onBeforeUnmount} from 'vue'
import { useProductos } from '@/modules/Productos/composables/useProductos'
import { usePedidoDet } from '@/modules/pedidos_det/composables/usePedidosDet'
import { showConfirmationDialog, showErrorNotification, showSuccessNotification } from '@/common/helper/notification'
import { usePedidoStore } from '@/stores/pedido'
import usePedidosEnc from '../../pedidos_enc/composables/usePedidosEnc'
import { obtenerListaPedidosDet } from '@/modules/pedidos_det/action/pedidosDetAction'
import { useCodigo } from '@/modules/codigo_barras/composables/useCodigo'
import { Notify } from 'quasar'
import { useTotalStore } from '@/stores/total'
import useFacturasEnc from '../../facturas_enc/composables/useFacturasEnc'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'
import { useConfiguracionStore } from '@/stores/serie'

const props = defineProps({
  pedidoId: {
    type: [String, Number],
    required: true
  }
})

const { mutateCrearPedidoDet, obtenerPedidosDetID, mutateActualizarPedidoDetId, mutateEliminarPedidoDetID, ListaDet1, ListaDet2, refetchListaDet2} = usePedidoDet()
const configuracionStore = useConfiguracionStore()
const { mutateCrearFacturaEnc } = useFacturasEnc()
const { mutateCrearFacturaEnc2 } = useFacturasEnc()
const { obtenerPedidoPorId } = usePedidosEnc()
const { todosProductos, refetchTodosProductos, obtenerProductosId } = useProductos()
const { obtenerPorCodigo } = useCodigo()
const $q = useQuasar()
const detallesPedido = ref([])
const codigoProducto = ref('')
const cantidad = ref(1)
const modalProductos = ref(false)
const filtroProductos = ref('')
const loadingProductos = ref(false)
const loadingPorCodigo = ref(false)
const loadingDetalle = ref(false)
const loadingAgregar = ref(false)
const pedidoStore = usePedidoStore()
const { consultarCodigo, consultarCodigoM } = useCodigo()
const totalStore = useTotalStore()
const modalFacturacion = ref(false)
const userStore = useUserStore()

const idPedidoEnc = computed(() => pedidoStore.idPedidoEnc)
const { data: pedidoData, refetchObtenerPedidoID } = obtenerPedidoPorId(idPedidoEnc)

// para facturacion
const { data: productosFactura, refetch: refetchProductosFactura, isLoading: cargandoProductosFactura } = ListaDet1(idPedidoEnc)

//cargar productos en factura
watch(modalFacturacion, (val) => {
  if (val) {
    refetchProductosFactura()
  }
})

// cargar nuevos productos
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    console.log('nuevo detalle')
    refetchObtenerPedidoID()
  }
})

// actualizar cliente en facturacion
watch(pedidoData, () => {
  console.log('pedidoData actualizado:', pedidoData.value)
})

// focus
const inputCodigo = ref(null)

const enfocarCodigo = () => {
  inputCodigo.value?.focus()
}

// usar F4
const usarF4 = (e) => {
  if (e.key === 'F4') {
    e.preventDefault()
    terminarVenta()
  }
}

//filtro 
const productosFil = computed(() => {
  if (!filtroProductos.value) return todosProductos.value

  const palabras = filtroProductos.value.toLowerCase().split(' ').filter(p => p.trim() !== '')

  return todosProductos.value.filter(prod => {
    const texto = (
      (prod.PRODUCT0 || '') + ' ' +
      (prod.DESCRIPCION_MARCA || '') + ' ' +
      (prod.DESCRIPCION_PROD || '')
    ).toLowerCase()

    return palabras.every(palabra => texto.includes(palabra))
  })
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

// abrir facturacion con F4
onMounted(() => {
  window.addEventListener('keydown', usarF4)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', usarF4)
})

// modal factura
const terminarVenta = () => {


  // si no existe pedido
if(!pedidoStore.idPedidoEnc ){
  showErrorNotification('No existe un pedido','Debes de crear un pedido primero' )
  return 
}
  modalFacturacion.value = true
}


// Guarda factura enc y det
const confirmarFactura = async () => {

  console.log('Confirmar factura presionada')
  console.log('Serie seleccionada desde el store:', configuracionStore.serieSeleccionada)
  try {
    const datos = {
      ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
      USUARIO_QUE_FACTURA: userStore.nombreVendedor,
      // aqui debo enviar la serie correcta
      SERIE: configuracionStore.serieSeleccionada
    }

    console.log('Datos enviados al backend:', datos)
    // Validación
    if (!datos.ID_PEDIDO_ENC || !datos.SERIE) {
      showErrorNotification('Factura','Faltan datos en la factura')
      return
    }

    console.log('ID_PEDIDO_ENC enviado:', pedidoStore.idPedidoEnc)
    console.log('Datos enviados al backend:', datos)
    // Ejecutar la facturación
    mutateCrearFacturaEnc2(datos, {
    onSuccess: (respuesta) => {
    showSuccessNotification('Factura', 'Factura creada con éxito')
    console.log('Respuesta del backend:', respuesta)

      },
      onError: (error) => {
        showErrorNotification('Factura', 'Error al crear la factura')
        console.error('Error', error)
      }
    })

    // acciones como limpiar, imprimir, cerrar modal

  } catch (error) {
    showErrorNotification('Factura','No se puedo crear la factura')
    console.error(error)
  }
}

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
    align: 'left',
    field: 'PRECIO_FINAL',
    sortable: true
  },
  {
    name: 'precioPromo',
    label: 'Precio Oferta',
    align: 'left',
    field: 'PRECIO_PROMOCION'
  },
  {
    name: 'accion',
    label: 'Acción',
    align: 'left'
  }
]

// Paginación del catálogo
const paginacionCatalogo = ref({
  sortBy: 'PRODUCTO',
  descending: false,
  page: 1,
  rowsPerPage: 100
})

// mostrar total 
const totalEncabezado = computed(() => {
  return pedidoData.value?.TOTAL_PEDIDO ?? 0
})

const totalPedido = () =>{
  return pedidoStore.idPedidoEnc
}

const limpiarFiltro = () => {
  filtroProductos.value = ''
}

// agregar productos - manualmente - codigo
const agregarProducto = () => {
  if (codigoProducto.value.trim()) {
    buscarProductoPorCodigo()
  }
}

// buscar por codigo escaneado 
const buscarProductoEscaneado = async () => {
  if (!codigoProducto.value) return

  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification('Error','Primero debe de crear un pedido')
    return
  }

  loadingPorCodigo.value = true
  const resultado = await consultarCodigoM(codigoProducto.value, 1) 

  if (!resultado || !resultado.producto || !resultado.precio) {
    showErrorNotification('Producto no encontrado', `El codigo ${codigoProducto.value} no existe`)
    codigoProducto.value = ''
    loadingPorCodigo.value = false
    return
  }

  const detalle = {
    ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
    PRODUCT0: resultado.producto.PRODUCT0,
    CANTIDAD_PEDIDA: 1,
    PRECIO_UNIDAD_VENTA: resultado.precio.PRECIO_FINAL,
    SUBTOTAL_VENTAS: 1 * resultado.precio.PRECIO_FINAL,
    DESCRIPCION_PROD_AUX: resultado.producto.DESCRIPCION_PROD,
    ID_SUCURSAL: '1',
    NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido
  }

      mutateCrearPedidoDet(detalle, {
      onSuccess: async (data) => {

      detallesPedido.value.push(data)
      showSuccessNotification('Producto agregado', `Agregado: ${codigoProducto.value}`)
      codigoProducto.value = '',
      
      await refetchObtenerPedidoID() 
        totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0)
        console.log(totalStore.TOTAL_GENERAL_PEDIDO)

    },
    onError: (err) => {
      console.error('Error al guardar producto:', err)
      $q.notify({ type: 'negative', message: 'Error al guardar producto' })
    },
    onSettled: () => {
      loadingPorCodigo.value = false
    }
  })
}


// escanear o ingresar codigo 
const buscarProductoPorCodigo = async () => {
  try {
    if (!codigoProducto.value.trim()) return

    const producto = await obtenerPorCodigo(codigoProducto.value.trim())
    if (!producto) {
      $q.notify({ type: 'warning', message: 'Producto no encontrado' })
      return
    }

    agregarProductoAlPedido(producto)
  } catch (error) {
    console.error('Error al buscar producto por código', error)
    showErrorNotification('Producto', 'El producto no existe')
  }
}


// crea pedido det desde catalogo
const agregarProductoAlPedido = async (producto) => {
  try {
    if (!producto || !producto.PRODUCT0 || cantidad.value <= 0) {
      console.error('Producto inválido o cantidad no válida')
      return
    }

    // mostrar en pantalla cargando
    loadingAgregar.value = true

    const detalle = {
      ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
      PRODUCT0: producto.PRODUCT0,
      CANTIDAD_PEDIDA: cantidad.value,
      PRECIO_UNIDAD_VENTA: producto.PRECIO_PROMOCION ?? producto.PRECIO_FINAL,
      SUBTOTAL_VENTAS: cantidad.value * (producto.PRECIO_PROMOCION ?? producto.PRECIO_FINAL),
      DESCRIPCION_PROD_AUX: producto.DESCRIPCION_PROD,
      ID_SUCURSAL: '1',
      NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido
    }

      console.log('Detalle a enviar:', detalle)

      mutateCrearPedidoDet(detalle, {
      onSuccess: async (data) => {

        //agrega el producto
        detallesPedido.value.push(data)
        showSuccessNotification('Producto agregado', 'Se agregó correctamente al pedido')
        codigoProducto.value = ''
        cantidad.value = 1

        await refetchObtenerPedidoID() 
        totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0)
        enfocarCodigo()

      },
      onError: (error) => {
        console.error('Error al guardar producto en BD:', error)
        $q.notify({ type: 'negative', message: 'No se pudo guardar el producto en la base de datos' })
      },
      onSettled: () => {
        loadingAgregar.value = false
      }
    })
  } catch (error) {
    console.error('Error al agregar producto:', error)
    loadingAgregar.value = false
  }
}

// agregar producto al seleccionarlo
const seleccionarProducto = (producto) => {
  agregarProductoAlPedido(producto)
  modalProductos.value = false
}

// mantener focus - not working so far
watch(modalProductos, (val) => {
  if(!val){
    enfocarCodigo()
  }

})

defineExpose({
  enfocarCodigo,
  totalPedido
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