<template>
  <div class="pedido-detalle-container">
   <q-card flat bordered class="q-pa-md q-mb-xs bg-yellow-1 text-black rounded-borders shadow-2 " >

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
        <q-toggle v-model="contingencia" label="Contingencia" color="yellow-9" keep-color class=" toggle-brillante" />
        <q-btn label="" icon="restart_alt" class="" @click="limpiar" />
        <q-btn label="Terminar Venta (F4)" icon="point_of_sale" @click="terminarVenta" class="boton-amarillo" />
      </div>

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
    <q-input v-model.number="cantidad2" label="Cantidad" type="number" outlined dense min="1" class="col-6 col-md-2"
    />

    <!-- Botones -->
    <div class="col-6 col-md-5 row q-gutter-sm">
      <q-btn @click="buscarProductoEscaneado" class="boton-amarillo" icon="add" label="Agregar" :loading="loadingAgregar" :disable="!codigoProducto"/>
      <q-btn @click="abrirCatalogo2" color="secondary" icon="inventory_2" label="Catálogo" class="col" outline/>

    </div>

  </div>
</q-card>
 
<!-- Modal de catálogo de productos -->
<q-dialog v-model="modalProductos2" maximized>
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
        :rows="productosFiltrados2"
        :columns="columnasCatalogo2"
        row-key="PRODUCT0"
        :loading="loadingProductos"
        :pagination="paginacionCatalogo"
        class="catalogo-table"
        :body-cell="() => {}"
      >
        <template #body="props">
          <q-tr :props="props" class="catalogo-row" @click="seleccionarProducto2(props.row)">
            
            <!-- Código del producto -->
            <q-td key="codigo">
              <div class="text-weight-medium">{{ props.row.PRODUCT0 }}</div>
            </q-td>

            <!-- Descripción del producto y mensaje -->
            <q-td key="producto">
              <div class="producto-catalogo">
                <div class="text-weight-bold text-uppercase" style="max-width: 600px; white-space: normal; word-break: break-word;">
                  {{ props.row.DESCRIPCION_PROD }}
                </div>
              </div>
            </q-td>

            <!-- Marca -->
            <q-td key="marca" class="q-pa-none">
              <q-chip size="12px" color="yellow" text-color="dark" class="q-ma-none q-pa-xs">
                {{ props.row.DESCRIPCION_MARCA }}
              </q-chip>
            </q-td>

            <!--  Cantidad -->
            <q-td key="cantidad">
                <q-input v-model="props.row.CANTIDAD_PEDIDA"  dense min="1" outlined style="max-width: 60px" @click.stop @change="cantidadIngresada(props.row)"/>
            </q-td>

            <!-- Precio final -->
            <q-td key="precio">
              <div v-if="new Date() >= new Date(props.row.FECHA_VIGENCIA_I) && new Date() <= new Date(props.row.FECHA_VIGENCIA_F) " class="text-subtitle1 text-grey text-strike">
                Q {{ props.row.PRECIO_SUGERIDO.toFixed(2) }}
              </div>
                      <!-- Tachar precio -->
              <div v-else class="text-subtitle1 text-weight-bold text-primary">
                Q {{ props.row.PRECIO_SUGERIDO.toFixed(2) }}
              </div>
            </q-td>

            <!-- Precio Oferta -->
            <q-td key="precioOferta">
              <div v-if="new Date() >= new Date(props.row.FECHA_VIGENCIA_I) && new Date() <= new Date(props.row.FECHA_VIGENCIA_F) ">
                <span class="text-positive text-subtitle1 text-weight-bold bg-green-1 q-px-md q-py-xs rounded-borders">
                  Q {{ Number(props.row.PRECIO_PROMOCION).toFixed(2) }}
                </span>

                <!-- Fecha local -->
               <div class="text-subtitle2" anchor="top middle" self="bottom middle">
                 Vigente al {{ new Date(props.row.FECHA_VIGENCIA_F).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}
               </div>
              </div>
              <div v-else class="text-grey-5">–</div>
            </q-td>
        
            <!-- Mostrar niveles de precio-->
            <q-td key="niveles">
              <div class="column items-start q-gutter-xs">
                <q-chip v-for="(nivel, index) in props.row.niveles" :key="index" dense size="md" text-color="black-10" class="q-mb-xs" style="background-color: transparent; border: none;"
                >
                  {{ nivel }}
                </q-chip>
              </div>
            </q-td>

          </q-tr>
        </template>

      </q-table>

    </q-card-section>

    </q-card>
  </q-dialog>


  <!-- Modal Para Facturacion -->
  <q-dialog v-model="modalFacturacion" @show="enfocarEfectivo" persistent transition-show="fade" transition-hide="fade">
    <q-card class="q-dialog-plugin q-pa-md" style="min-width: 700px; max-width: 90vw; max-height: 90vh">
      
      <!-- header-->
      <q-card-section class="row q-pa-xs items-center justify-between">

        <div class="text-h6 text-primary">Facturación </div>

        <div v-if="contingencia" class="text-red-6" style="font-size: 19px;">Factura en contingencia</div>

        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section > 

       <q-separator />

        <div class="text-h6 text-center text-gray-8 q-pb-xs q-pt-md" style="font-size: 22px">{{ `Pedido: # ${pedidoStore.numeroDePedido} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Serie: ${configuracionStore.serieSeleccionada}` }}</div>

          <!-- Mostrar info cliente-->
        <q-card-section>
        <q-card class="q-mb-md q-pb bg-grey-1">
        <q-card-section class="q-pa-xs row q-col-gutter-sm items-start">
          <div class="col-auto">
            <q-icon name="person" size="36px" color="yellow-8" />
          </div>
          <div class="col">
            <div class="text-subtitle2 text-weight-bold text-black">
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
        
        <!-- total verde bonito -->
        <q-card-section class="q-pa-none q-pb-md">

          <div
            class="bg-green-5 text-black text-center q-pa-sm"
            style="font-size: 240%; font-weight: bold;"
          >
            Total Q.{{ pedidoData.TOTAL_GENERAL_PEDIDO.toFixed(2) }}
          </div>

        </q-card-section>

                    <!-- Opcion de pago -->
            <q-card-section class="q-gutter-md">
              <div class="row q-col-gutter-md items-start">
              
                <!-- Selector de tipo de pago -->
                <div class="col-12 col-sm-4">
                  <q-select
                    v-model="tipoPago"
                    :options="opcionesPago2"
                    label="Tipo de Pago"
                    outlined
                    dense
                    class="bg-grey-3"
                    input-class="text-bold"
                  >
                    <template v-slot:prepend>
                      <q-icon name="payment" color="primary" />
                    </template>
                  </q-select>
                </div>
              
                <!-- Campo efectivo -->
                <div class="col-12 col-sm-4">
                  <q-input ref="focusEfectivo" v-model="montoEfectivo" label="Efectivo" prefix="Q" :disable="tipoPago !== 'EFECTIVO' && tipoPago !== 'MIXTO'" outlined dense class="bg-grey-3" input-class="text-bold" type="number" min="0" @keydown.enter.prevent="confirmarFactura"
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_balance_wallet" color="brown" />
                    </template>
                  </q-input>
                </div>
              
                <!-- Campo tarjeta -->
                <div class="col-12 col-sm-4">
                  <q-input ref="focusTarjeta" v-model="montoTarjeta" label="Tarjeta" prefix="Q" :disable="tipoPago !== 'TARJETA' && tipoPago !== 'MIXTO'" outlined dense class="bg-grey-3" input-class="text-bold" type="number" min="0" @keydown.enter.prevent="confirmarFactura"
                  >
                    <template v-slot:prepend>
                      <q-icon name="credit_card" color="blue" />
                    </template>
                  </q-input>
                </div>
              
              </div>
            </q-card-section>

            <q-card-section class="q-pa-sm">
            
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-sm">
              {{  calcularCambio > 0 ? `Cambio: Q. ${calcularCambio.toFixed(2)}` : 'No hay cambio' }} 
            </div>

            </q-card-section>

        <!-- Cuponazos -->
        <q-card-section class="q-pa-sm">

          <q-btn class="q-mb-sm" color="primary" label="Agregar Cuponazo" icon="add" @click="abrirCuponazo" />
        
        </q-card-section>

            </q-card-section>

      <!-- Acciones -->
    <q-card-actions align="right">
      <q-btn flat label="Cancelar" @click="enfocarEfectivo" v-close-popup />
      <q-btn icon="taskalt" label="Confirmar Factura" class="boton-amarillo q-ml-auto" @click="confirmarFactura()"  />
    </q-card-actions>
       
    </q-card>
  </q-dialog>

  <!-- Modal de cuponazo -->
  <q-dialog v-model="modalCuponazo" persistent transition-show="fade" transition-hide="fade">
      <q-card class="q-dialog-plugin q-pa-md" style="min-width: 400px; max-width: 90vw; max-height: 90vh">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary">Cuponazo</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input ref="refCupon"  v-model="cupon" label="Código del Cuponazo"  @keyup.enter="aplicarCuponazo" outlined dense />
          <!-- <q-input v-model="clave" label="Clave " type="password" outlined dense class="q-mt-md" /> -->
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn label="Aplicar Cuponazo" class="boton-amarillo"   @click="aplicarCuponazo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  <!-- Modal de cantidad-->
  <q-dialog v-model="modalCantidad" persistent transition-show="fade" transition-hide="fade" @hide="volverAFocusInput">
      <q-card class="q-dialog-plugin q-pa-md" style="min-width: 400px; max-width: 90vw; max-height: 90vh">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6 text-primary">Cantidad del Producto</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input v-model.number="cantidad2" ref="focusCantidad" label="Cantidad" type="number" outlined dense min="1" @keyup.enter.prevent="actualizarCantidad()"/>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
        </q-card-actions>
      </q-card>
  </q-dialog>

  </div>
</template>

<script setup >

import { useQuasar } from 'quasar'
import { ref, computed, onMounted, watch, watchEffect, onBeforeUnmount, nextTick} from 'vue'
import { useProductos } from '@/modules/Productos/composables/useProductos'
import { usePedidoDet } from '@/modules/pedidos_det/composables/usePedidosDet'
import { showConfirmationDialog, showErrorNotification, showSuccessNotification, showConfirmationInsideModal, showErrorNotificationInside, showSuccessNotificationInside } from '@/common/helper/notification'
import { usePedidoStore } from '@/stores/pedido'
import usePedidosEnc from '../../pedidos_enc/composables/usePedidosEnc'
import { useCodigo } from '@/modules/codigo_barras/composables/useCodigo'
import { Notify } from 'quasar'
import { useTotalStore } from '@/stores/total'
import { useUserStore } from '@/stores/user'
import { useConfiguracionStore } from '@/stores/serie'
import { cleanAllStores } from '@/common/helper/cleanStore'
import { useSync } from '@/modules/sync/composables/useSync'
import { usePdfFactura } from '@/modules/facturar_pdf/composables/usePdFactura'
import { useClienteStore } from '@/stores/cliente'
import { useFacturasEnc } from '@/modules/facturas_enc/composables/useFacturasEnc'
import { useCertification } from '@/modules/certification/composables/useCertification'
import { useDatosFel } from '@/modules/fel_empresa_establecimiento/composables/useFelDatos'
import { useCupones } from '@/modules/cupones/composables/useCupones'

const props = defineProps({
  pedidoId: {
    type: [String, Number],
    required: true
  },
  onNuevoPedido: {
    type: Function,
    required: true
  }
})

const { mutateAplicarCupon } = useCupones()
const { datosEmpresa, datosEstablecimiento } = useDatosFel()
const contingencia = ref(false)
const { mutateCertificar } = useCertification()
const { obtenerDetalleFactura, obtenerFacturasEnc, obtenerFacturaId3 } = useFacturasEnc()
const { data: factura3 } = obtenerFacturaId3()
const clienteStore = useClienteStore()
const { generarFacturaPDF } = usePdfFactura()
const { mutateCrearSincronizacion } = useSync()
const { mutateCrearPedidoDet, obtenerPedidosDetID, mutateActualizarPedidoDetId, mutateEliminarPedidoDetID, ListaDet1, ListaDet2, refetchListaDet2} = usePedidoDet()
const configuracionStore = useConfiguracionStore()
const { mutateCrearFacturaEnc2 } = useFacturasEnc()
const { obtenerPedidoPorId } = usePedidosEnc()
const { todosProductos, refetchTodosProductos, obtenerProductosId, precioReal } = useProductos()
const { obtenerPorCodigo } = useCodigo()
const $q = useQuasar()
const detallesPedido = ref([])
const codigoProducto = ref('')
const cantidad = ref(1) // Cantidad en el boton
const cantidad2 = ref(1) // para modal cantidad
const montoEfectivo = ref(null)
const montoTarjeta = ref(null)
const opcionesPago2 = ['EFECTIVO', 'TARJETA', 'MIXTO']
const tipoPago = ref('EFECTIVO') 
const calcularCambio = ref(0)
const refCupon = ref()
const cupon = ref('')
const clave = ref('')
const modalCantidad = ref(false)
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
const modalCuponazo = ref(false)
const idPedidoEnc = computed(() => pedidoStore.idPedidoEnc)
const { data: pedidoData, refetchObtenerPedidoID } = obtenerPedidoPorId(idPedidoEnc)
const focusCantidad = ref(null) // focus modal cantidad
const { refetch: relistaDet2 } = ListaDet2(idPedidoEnc)
const focusEfectivo = ref(null) // focus efectivo
const focusTarjeta = ref(null)
const modalProductos2 = ref(false)
// para facturacion, no mostrar por ahora
const { data: productosFactura, refetch: refetchProductosFactura, isLoading: cargandoProductosFactura } = ListaDet1(idPedidoEnc)

// filtro del catalogo
const productosFiltrados2 = computed(() => {
  if (!filtroProductos.value) return productosUnicos.value

  const palabras = filtroProductos.value.toLowerCase().split(' ').filter(p => p.trim() !== '')

  return productosUnicos.value.filter(p => {
    const campos = `${p.DESCRIPCION_PROD || ''} ${p.DESCRIPCION_MARCA || ''} ${p.PRODUCT0 || ''}`.toLowerCase()
    return palabras.every(palabra => campos.includes(palabra))
  })
})

// mapear los productos para mostrar un registro en la tabla 
const productosUnicos = computed(() => {
  if (!todosProductos.value) return []

  const mapa = new Map()

  for (const prod of todosProductos.value) {
    const clave = prod.PRODUCT0

    const nivelTexto = `Q ${prod.PRECIO_FINAL.toFixed(2)} ( ${prod.CANTIDAD_INICIAL} a ${prod.CANTIDAD_FINAL} )`

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        ...prod,
        niveles: [nivelTexto]
      })
    } else {
      mapa.get(clave).niveles.push(nivelTexto)
    }
  }

  return Array.from(mapa.values())
})

const cantidadIngresada = (producto) => {
  if (!producto.CANTIDAD_PEDIDA || producto.CANTIDAD_PEDIDA <= 0) {
    showErrorNotification("Cantidad", "Ingrese una cantidad válida")
    return
  }
}

// Cupon
const aplicarCuponazo = () => {

const datosCupon = {
  numero_cupon: cupon.value,
  id_pedido_enc: pedidoStore.idPedidoEnc,
  usuario: userStore.nombreVendedor // codigo
}

//console.log('datos del cupon: ', datosCupon)

  mutateAplicarCupon(datosCupon, {
    onSuccess: (res) => {
      showSuccessNotificationInside('Aplicado','Cupon aplicado con exito')
      modalCuponazo.value = false

      nextTick()
      
    },
    onError: (error) => {
      showErrorNotificationInside('Error', error)
    }
  })

  enfocarEfectivo()
}

// focus al Efectivo  
const enfocarEfectivo = async () => {
  await nextTick()
  focusEfectivo.value?.focus()
}

// focus en modal cupon
watch(modalCuponazo, (val) => {
  if (val)
  nextTick(() => {
    refCupon.value?.$el.querySelector('input')?.select()
  })
})

//focus al modal cantidad
watch(modalCantidad, (val) => {
  if (val) {
    nextTick(() => {
     focusCantidad.value?.$el.querySelector('input')?.select()
    })
  }
})

//cargar productos en factura
watch(modalFacturacion, (val) => {
  if (val) {
    refetchProductosFactura()
  }
})

// cargar nuevos productos
watch(idPedidoEnc, (nuevo) => {
  if (nuevo && nuevo > 0) {
    refetchObtenerPedidoID()
  }
})

// actualizar cliente en facturacion
watch(pedidoData, () => {
  refetchObtenerPedidoID()
})

// Despues del cantidad volver al focus del input
const volverAFocusInput = () => {
  setTimeout(() => {
    inputCodigo.value?.focus()
  }, 100)
}

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

// limpiar pedido
const usarDelete = (e) => {
  if (e.key === 'Delete') {
    e.preventDefault()
    limpiar()
  }
}

// usar multiplicador
const usarMultiplicador = (e) =>{
  if (e.key === '*') {
    e.preventDefault()
    abrirModalCantidad()
  }
}

// cerrar modal de cantidad con enter
const actualizarCantidad = () => {
  if(cantidad2.value > 1) 
  {
    modalCantidad.value = false
    return
  }
}

// Filtro antiguo - not in use
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

// limpiar pantalla
const limpiar = async () => {
  const confirmado = await showConfirmationDialog(
    'Limpiar Pedido',
    '¿Estás seguro de que deseas iniciar un nuevo pedido?'
  )

  if (confirmado) {
    cleanAllStores()
    enfocarCodigo()
    
   // await expansion.value.show()
   window.location.reload()
  }
}

// modal cuponazo
const abrirCuponazo = async () => {
  modalCuponazo.value = true

  await nextTick()

  refCupon.value?.focus()
}

// nuevo catalogo
const abrirCatalogo2 = () => {
  modalProductos2.value = true
}

const abrirModalCantidad = () => {
  modalCantidad.value = true
}

// Multiplicador
onMounted(() => {
  window.addEventListener('keydown', usarMultiplicador)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', usarMultiplicador)
})

// limpiar
onMounted(() => {
  window.addEventListener('keydown', usarDelete)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', usarDelete)
})

// Abrir facturacion con F4
onMounted(() => {
  window.addEventListener('keydown', usarF4)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', usarF4)
})

// calcular cambio
const calcularCambioModal = () => {

  if (opcionesPago2==='MIXTO')
    calcularCambio.value = 0

    else {
  calcularCambio.value = montoEfectivo.value - totalStore.totalGeneral
    }
}

// si el efectivo cambia, calcular cambio
watch(montoEfectivo, (nuevoValor) => {
  if (nuevoValor !== null && nuevoValor >= 0) {
    calcularCambioModal()
  } else {
    calcularCambio.value = 0
  }
})

//focus a efectivo
watch(tipoPago, async (nuevo) => {
  if(nuevo === 'EFECTIVO'){
    await nextTick()
      focusEfectivo.value?.focus()
  }
})

// focus desde mixto
watch(tipoPago, async(nuevo) => {
  if(nuevo === 'MIXTO'){
    await nextTick()
    focusEfectivo.value?.focus()
  }
}) 

// focus a tarjeta
watch(tipoPago, async (nuevo) => {
  if(nuevo === 'TARJETA'){
    await nextTick()
    focusTarjeta.value?.focus()
  }
})

// limpiar campos de pago 
watch(tipoPago, (nuevo) => {
  if( nuevo === 'EFECTIVO'){
    montoTarjeta.value = null
  } else if (nuevo === 'TARJETA') {
    montoEfectivo.value = null
  } else if (nuevo === 'MIXTO') {
    montoEfectivo.value = null
    montoTarjeta.value = null
  }
})

const formatearFecha = (fecha) => {
  return new Date (fecha).toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const certificarFactura = async (id) => {

const factura = await obtenerFacturaId3(id)
console.log('datos de factura:', factura)

await mutateCertificar(
  { sucursal:'1', serie: factura.SERIE, numero: factura.NUMERO_FACTURA,  },
  {
    onSuccess: async (data) => {

    const detalle = await obtenerDetalleFactura(id)

    console.log('dataCertificados', data)

    if (!detalle || detalle.length === 0) return

    try {

    const itemsFactura = detalle.map((item) => ({
      cantidad: item.CANTIDAD_VENDIDA,
      descripcion: item.producto.DESCRIPCION_PROD,
      precio: `Q ${parseFloat(item.PRECIO_UNITARIO_VTA).toFixed(2)}`,
      subtotal: `Q ${parseFloat(item.SUBTOTAL_GENERAL).toFixed(2)}`
    }))

    const totalItems = itemsFactura.reduce((total, item) => total + Number(item.cantidad), 0)

    const dataFactura = {
      encabezado: {
        serie: data.SerieFacturaFel,
        numero: contingencia ? factura.CORR_CONTINGENCIA : data.NumeroFacturaFel,
        uuid: data.Uuid,
        fechaEmision: formatearFecha(data.FechaAccion),
        numeroInterno: `${factura.SERIE} | ${factura.NUMERO_FACTURA}`,
        tipoDocumento: contingencia ? "FACTURA EN CONTINGENCIA" : "FACTURA ELECTRONICA" 
      },
      cliente: {
        nombre: factura.NOMBRE_CLI_A_FACTUAR,
        nit: factura.NIT_CLIEN_A_FACTURAR,
        direccion: factura.DIRECCION_CLI_FACTUR
      },
      items: itemsFactura,
      resumen: {
        subtotal: `Q. ${factura.TOTAL_GENERAL.toFixed(2)}`,
        descuento: `Q. ${factura.MONTO_DESCUENTO_FACT.toFixed(2)}`,
        totalPagar: `Q. ${factura.TOTAL_GENERAL.toFixed(2)}`,
        totalItems
      },
      nombreVendedor: factura.USUARIO_QUE_FACTURA || 'Desconocido',
      qrCodeData: 'Pendiente'
    }

    await generarFacturaPDF(dataFactura)

    } catch (error) {
    console.error('Error imprimiendo factura:', error)
    showErrorNotification('Error al imprimir factura', 'Error')
  }

    },
    onError: (error) => {
      console.error(' Error certificando factura:', error)
    }
  }
)

}

// modal factura
const terminarVenta = async () => {

await nextTick() // epserar los productos para verlos en factura

  // si no existe pedido
if(!pedidoStore.idPedidoEnc ){
  showErrorNotification('No existe un pedido','Debes de crear un pedido primero' )
  return 
}
  modalFacturacion.value = true
}

// Guarda factura enc y det
const confirmarFactura = async () => {

    // modal confirmacion factura
    const confirmarFac = await showConfirmationInsideModal('Facturar','Esta seguro que desea facturar')

    // esperar confirmacion de factura
    await nextTick()
    if(!confirmarFac) return

    try {
    const datos = {
      ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
      USUARIO_QUE_FACTURA: userStore.nombreVendedor,
      SERIE: configuracionStore.serieSeleccionada,
     // POR_DESCUENTO_GLOB: 1  // temporal hasta agregar descuento
    }

    // Validación
    if (!datos.ID_PEDIDO_ENC || !datos.SERIE) {
      showErrorNotification('Factura','No hay serie para facturar ')
      return
    }

    // Ejecutar la facturación
    await mutateCrearFacturaEnc2(datos, {

    onSuccess: async (respuesta) => {

    modalFacturacion.value = false
    await showSuccessNotification('Factura', 'Factura creada con éxito')
    
    // crear sincronización
    await mutateCrearSincronizacion(respuesta.ID_FACTURA_ENC)
    
    // certificar factura
    //await certificarFactura(respuesta.ID_FACTURA_ENC)

      // mandar a imprimir
    await certificarFactura(respuesta.ID_FACTURA_ENC)


    // limpiar stores
    cleanAllStores()

    props.onNuevoPedido()

    //refrescar la pagina
    //window.location.reload()
    },

      onError: (error) => {
        showErrorNotification('No hay Productos','Debe ingresar al menos un producto al pedido')
        console.error(error)
      }
    })

  } catch (error) {
    showErrorNotification('No hay Productos','Debe ingresar al menos un producto al pedido')
    console.error(error)
  }
  // borrar efectivo
  montoEfectivo.value = (null)
}

const columnasCatalogo2 = [
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
    name: 'cantidad',
    label: 'Cantidad',
    align: 'left',
    field: 'CANTIDAD_PEDIDA',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio',
    align: 'left',
    field: 'PRECIO_SUGERIDO',
    sortable: true
  },
  {
    name: 'precioPromo',
    label: 'Precio Oferta',
    align: 'left',
    field: 'PRECIO_PROMOCION'
  },
  {
    name: 'niveles',
    label: 'Niveles de precio',
    align: 'left',
    field: 'SECUENCIA_PRECIO'
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

// Buscar producto por código escaneado o ingresado manualmente
const buscarProductoEscaneado = async () => {
  if (!codigoProducto.value) return

  if (!pedidoStore.idPedidoEnc) {
    showErrorNotification('No hay pedido', 'Debe de crear un pedido primero')
    return
  }

  loadingPorCodigo.value = true
  let resultado = null

  // 1. buscar por código de barras
  try {
    resultado = await consultarCodigoM(codigoProducto.value, cantidad2.value) 

  } catch (error) {
    console.warn('Código no encontrado por código de barras:', error)
  }

  // 2. buscar por ID de producto
  if (!resultado || !resultado.producto ) {

    try {
      const productoDirecto = await precioReal(codigoProducto.value, cantidad2.value)

      // datos a consultar
      console.log('mandando a consultar el precio: ', codigoProducto.value, cantidad2.value)

      if(productoDirecto.PRECIO_FINAL === 0 || productoDirecto.PRECIO_FINAL === null){
       showErrorNotification('Producto sin precio', `El código ${codigoProducto.value} no tiene precio`)
        codigoProducto.value = ''
        loadingPorCodigo.value = false
        return
      }

      const prod = Array.isArray(productoDirecto) ? productoDirecto[0] : productoDirecto

      console.log('yo soy prod', prod)

      if (!prod) {
        throw new Error('No encontrado')
      }

      resultado = {
        producto: {
          PRODUCT0: codigoProducto.value,
        },
        precio: {
          PRECIO_FINAL: prod.PRECIO_FINAL,
        }
      }

      console.log('resultado2: ', resultado)

    } catch (err) {

      showErrorNotification('Producto no encontrado', `El código ${codigoProducto.value} no existe`)
      codigoProducto.value = ''
      loadingPorCodigo.value = false
      return
    }
  } 

  // 3. Insertar producto al pedido
    const detalle = {
    ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
    PRODUCT0: codigoProducto.value,
    CANTIDAD_PEDIDA: cantidad2.value || 1, // usar cantidad del modal o 1 por defecto
    PRECIO_UNIDAD_VENTA: Number(resultado.precio.PRECIO_FINAL.toFixed(4)),
    SUBTOTAL_VENTAS: Number((1 * resultado.precio.PRECIO_FINAL).toFixed(4)),
    DESCRIPCION_PROD_AUX: resultado.producto.DESCRIPCION_PROD || '', // vacio
    ID_SUCURSAL: '1',
    NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido
  }

  console.log('impriendo detalle', detalle )

  mutateCrearPedidoDet(detalle, {
    onSuccess: async (data) => {
      detallesPedido.value.push(data)
      //showSuccessNotification('Producto agregado', `Agregado: ${codigoProducto.value}`)
      codigoProducto.value = ''
      totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0)
      relistaDet2() // Refrescar lista de detalles
      cantidad2.value = 1 // Resetear cantidad del modal
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

// crea pedido det desde catalogo
const agregarProductoAlPedido2 = async (producto) => {
  try {
    const cantidadFinal = producto.CANTIDAD_PEDIDA || 1

    // Validación
    if (!producto || !producto.PRODUCT0 || cantidadFinal <= 0) {
      console.error('Producto inválido o cantidad no válida')
      return
    }

    // Mostrar loading
    loadingAgregar.value = true

    // Obtener precio real desde backend
    const precio = await precioReal(producto.PRODUCT0, cantidadFinal)
    if (!precio || !precio.PRECIO_FINAL) {
      throw new Error('No se pudo obtener el precio real del producto')
    }

    //console.log('Si se guarda en precio xd: ', precio)
    // Armar detalle para guardar
    const detalle2 = {
      ID_PEDIDO_ENC: pedidoStore.idPedidoEnc,
      PRODUCT0: producto.PRODUCT0,
      CANTIDAD_PEDIDA: cantidadFinal,
      PRECIO_UNIDAD_VENTA: precio.PRECIO_PROMOCION ?? precio.PRECIO_FINAL,
      SUBTOTAL_VENTAS: cantidadFinal * (precio.PRECIO_PROMOCION ?? precio.PRECIO_FINAL),
      DESCRIPCION_PROD_AUX: producto.DESCRIPCION_PROD,
      ID_SUCURSAL: '1',
      NUMERO_DE_PEDIDO: pedidoStore.numeroDePedido
    }

    // Enviar a backend
    mutateCrearPedidoDet(detalle2, {
      onSuccess: async (data) => {
        detallesPedido.value.push(data)
        codigoProducto.value = ''
        producto.CANTIDAD_PEDIDA = 1
        relistaDet2()
        await refetchObtenerPedidoID()
        totalStore.setTotal(pedidoData.value?.TOTAL_GENERAL_PEDIDO || 0)
        enfocarCodigo()

        $q.notify({
          type: 'success',
          message: `Producto ${detalle2.PRODUCT0} agregado con exito`, 
          position: 'top',
          color: 'green',
          timeout: 2000,
          group: false,  // se muestra de inmediato
          progress: false

        })

        //console.log('detalle2',detalle2)
      },
      onError: (error) => {
        console.error('Error al guardar producto en BD:', error)
        showErrorNotification('No hay pedido', 'Debe de crear un pedido primero')
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

// enviar producto desde catalogo
const seleccionarProducto2 = (producto) => {
  agregarProductoAlPedido2(producto)
  // por si lo quiere ocultar 
  //modalProductos2.value = false
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

/* tabla */
.q-table tbody td {
  padding: 12px 16px;
}

.q-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.toggle-brillante.q-toggle--truthy {
  transition: all 0.3s ease-in-out;
  box-shadow: 0 0 10px 4px rgba(255, 235, 59, 0.6); /* amarillo brillante */
  border-radius: 999px;
}

</style>