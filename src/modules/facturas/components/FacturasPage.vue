<template>
  <q-page class="q-pa-md">
    <!-- Header compacto -->
    <div class="page-header q-mb-md">
      <div class="text-h5 text-weight-bold text-grey-8">
        <q-icon name="receipt_long" size="sm" class="q-mr-sm text-amber-7" />
        Historial de Facturas
      </div>
      <div class="text-body2 text-grey-6">
        Gestiona y consulta el historial completo de facturación
      </div>
    </div>

    <!-- Barra de búsqueda compacta -->
    <q-card flat bordered class="search-card q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row items-center q-gutter-md">
          <div class="col-md-8 col-12">
            <q-input 
              v-model="filtro" 
              label="Buscar por cliente o número de factura" 
              dense 
              outlined
              debounce="300"
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>
          </div>

        </div>
      </q-card-section>
    </q-card>

    <!-- Grid  -->
    <div v-if="mostrarUltimasFacturas.length" class="row q-gutter-md">
      <div 
        v-for="factura in mostrarUltimasFacturas" 
        :key="factura.ID_FACTURA_ENC"
        class="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12"
      >
        <q-card 
          flat 
          bordered 
          class="factura-card" 
        >
          <!-- Header compacto -->
          <q-card-section class="card-header q-pa-sm">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold text-grey-8">
                  <q-icon name="receipt" size="xs" class="q-mr-xs" />
                  #{{ `${factura.NUMERO_FACTURA} - Serie: ${factura.SERIE}`  }}
                </div>

                <div class="text-caption text-grey-6 fecha-factura">
                  {{ formatearFecha(factura.FECHA_DE_FACTURA) }}
                </div>
              </div>
              <div class="col-auto">
                <q-avatar size="32px" color="amber-1" text-color="amber-8" icon="business" />
              </div>
            </div>
          </q-card-section>

          <!-- Contenido compacto -->
          <q-card-section class="q-pa-sm q-pt-none">
            <div class="cliente-section q-mb-sm">
              <div class="text-caption text-grey-7 q-mb-xs">
                <q-icon name="person" size="xs" class="q-mr-xs" />
                Cliente
              </div>
              <div class="text-body2 text-weight-medium text-grey-9 client-name">
                {{ factura.NOMBRE_CLI_A_FACTUAR }}
              </div>
              <div class="text-body2 text-weight-medium text-grey-9 client-name">
                {{ factura.NIT_CLIEN_A_FACTURAR }}
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="total-section text-center">
              <div class="text-caption text-grey-7 q-mb-xs">
                <q-icon name="payments" size="xs" class="q-mr-xs" />
                Total
              </div>
              <div class="text-h6 text-weight-bold text-green-7">
                Q {{ factura.TOTAL_GENERAL.toFixed(2) }}
              </div>
            </div>
          </q-card-section>

          <!-- Acciones con más espacio -->
          <q-card-actions class="q-pa-sm q-pt-xs">
            <q-btn 
              flat 
              dense 
              size="sm"
              icon="print" 
              color="grey-7" 
              class="action-btn flex-1"
              @click="reimprimirFactura(factura.ID_FACTURA_ENC)"
            >
              <q-tooltip>Reimprimir</q-tooltip>
            </q-btn>

            <q-btn 
              flat 
              dense 
              size="sm"
              icon="visibility" 
              color="amber-8" 
              class="action-btn flex-1"
              @click.stop="verDetalleFactura(factura.ID_FACTURA_ENC)"
            >
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
          </q-card-actions>

        </q-card>
      </div>
    </div>

    <!-- Estado vacío compacto -->
    <div v-else class="empty-state">
      <q-card flat bordered class="q-pa-lg text-center">
        <q-icon name="receipt_long" size="3em" color="grey-4" class="q-mb-md" />
        <div class="text-h6 text-grey-6 q-mb-sm">No hay facturas encontradas</div>
        <div class="text-body2 text-grey-5">
          {{ filtro ? 'Intenta con otros términos de búsqueda' : 'No existen facturas registradas' }}
        </div>
      </q-card>
    </div>

    <!-- Modal mejorado -->
    <q-dialog v-model="mostrarDetalle" persistent>
      <q-card style="min-width: 700px; max-width: 90vw; max-height: 85vh">
        
        <!-- Header elegante -->
        <q-card-section class="modal-header q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h6 text-weight-bold text-grey-8">
                <q-icon name="receipt_long" class="q-mr-sm text-amber-7" />
                Detalle de Factura
              </div>

              <div class="text-caption text-grey-6">
                Información completa de productos
              </div>
            </div>
            <div class="col-auto">
              <q-btn flat dense round icon="close" color="grey-7" v-close-popup class="close-btn"
              />
            </div>

          </div>
        </q-card-section>

        <q-separator />

        <!-- Contenido optimizado -->
        <q-card-section class="q-pa-none" style="max-height: 450px">
          <q-scroll-area style="height: 450px">
            <div class="q-pa-md">
              <div v-if="detalleFactura.length">
                <div 
                  v-for="(item, index) in detalleFactura" 
                  :key="index"
                  class="producto-item q-mb-sm"
                >
                  <q-card flat bordered class="producto-card">
                    <q-card-section class="q-pa-md">
                      <div class="row items-center">
                        <div class="col-7">
                          <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-xs">
                            <q-icon name="inventory_2" size="xs" class="q-mr-xs text-amber-7" />
                            {{ item.PRODUCT0.trim() }}
                          </div>
                          <div class="text-caption text-grey-6">
                            Cantidad: {{ item.CANTIDAD_VENDIDA }} | 
                            Precio: Q {{ Number(item.PRECIO_UNITARIO_VTA).toFixed(2) }}
                          </div>
                        </div>
                        <div class="col-5 text-right">
                          <div class="text-caption text-grey-6">Subtotal</div>
                          <div class="text-h6 text-weight-bold text-green-7">
                            Q {{ Number(item.SUBTOTAL_GENERAL).toFixed(2) }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <div v-else class="text-center text-grey q-pa-xl">
                <q-icon name="inventory_2" size="3em" color="grey-4" class="q-mb-md" />
                <div class="text-h6 text-grey-6">No hay productos en esta factura</div>
              </div>
            </div>
          </q-scroll-area>
        </q-card-section>

        <!-- Footer -->
        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cerrar" color="grey-7" icon="close" v-close-popup class="q-px-lg"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import useFacturasEnc from '../../facturas_enc/composables/useFacturasEnc'
import { showErrorNotification } from '@/common/helper/notification'
import { usePdfFactura } from '@/modules/facturar_pdf/composables/usePdFactura'
import { useDatosFel } from '../../fel_empresa_establecimiento/composables/useFelDatos'
import { DatosEmpresa } from '../../facturar_pdf/interfaces/pdfInterface';
import { Establecimiento } from '../../fel_empresa_establecimiento/interfaces/establecimientoInterfaces';

const filtro = ref('')
const mostrarDetalle = ref(false)
const detalleFactura = ref<any[]>([])
const idSeleccionado = ref<number | null>(null)
const { obtenerFacturasEnc, obtenerDetalleFactura } = useFacturasEnc()
const { data: facturasData, isLoading } = obtenerFacturasEnc()
const { generarFacturaPDF } = usePdfFactura()
const { obtenerDatosFel } = useFacturasEnc()
const { obtenerDatosEmpresa, obtenerDatosEstablecimiento} = useDatosFel()

//Mostrar solo las ultimas 100 facturas
const mostrarUltimasFacturas = computed (()=>{
  return facturasFiltradas.value
    .sort((a, b) => new Date(b.FECHA_DE_FACTURA).getTime() - new Date(a.FECHA_DE_FACTURA).getTime())
    .slice(0, 100)
})

// filtrar facturas
const facturasFiltradas = computed(() => {
  return (facturasData.value ?? [])
    .slice() 
    .sort((a, b) => new Date(b.FECHA_DE_FACTURA).getTime() - new Date(a.FECHA_DE_FACTURA).getTime()) // orden descendente
    .filter(f =>
      String(f.NUMERO_FACTURA).toLowerCase().includes(filtro.value.toLowerCase()) ||
      String(f.NOMBRE_CLI_A_FACTUAR).toLowerCase().includes(filtro.value.toLowerCase())
    )
})

// Cargar detalle al abrir el modal
const verDetalleFactura = async (id: number) => {
  idSeleccionado.value = id
  const resultado = await obtenerDetalleFactura(id)
  detalleFactura.value = resultado
  mostrarDetalle.value = true
}

// Formatear fecha
const formatearFecha = (fechaIso:Date) => {
  return new Date (fechaIso).toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

const reimprimirFactura = async (idFactura: number) => {

  try {
    const factura = facturasData.value.find(f => f.ID_FACTURA_ENC === idFactura)
    if (!factura) {
      showErrorNotification('Factura no encontrada','No existe esta factura' )
      return
    }

    const datosFelCertificados = await obtenerDatosFel(factura.NUMERO_FACTURA)

    const datosEmpresa1 = await obtenerDatosEmpresa(1)
    const datosEstablecimiento1 = await obtenerDatosEstablecimiento(1)

    console.log('datos factura', factura)
    // console.log(datosFelCertificados)
    // console.log(factura.NUMERO_FACTURA)
    // console.log(datosEmpresa1)
    // console.log(datosEstablecimiento1)

    const detalle = await obtenerDetalleFactura(idFactura)
    if (!detalle || detalle.length === 0) {
      return
    }

    // Armar los items para el PDF
    const itemsFactura = detalle.map((item: any) => ({
      cantidad: item.CANTIDAD_VENDIDA,
      descripcion: item.producto.DESCRIPCION_PROD,
      precio: `Q ${parseFloat(item.PRECIO_UNITARIO_VTA).toFixed(2)}`,
      subtotal: `Q ${parseFloat(item.SUBTOTAL_GENERAL).toFixed(2)}`
    }))

    // Calcular total de items
    const totalItems = itemsFactura.reduce((total, item) => total + Number(item.cantidad), 0)

    //fecha de emision
    const fecha = new Date(datosFelCertificados?.FECHA_ACCION)
    const fechaEmisionValida = !isNaN(fecha.getTime()) ? fecha.toLocaleString() : ''


    // Armar el objeto dataFactura para el PDF
    const dataFactura = {

      empresa: {
        nombreComercial: datosEmpresa1.NOMBRE_COMERCIAL,
        razonSocial: datosEmpresa1.NOMBRE_EMISOR,
        direccionEmpresa: datosEstablecimiento1.DIRECCION_ESTABLECIMIENTO,
        nitEmpresa: datosEmpresa1.NIT_EMISOR,
        telefonoEmpresa: datosEstablecimiento1.TELEFONO_ESTABLECIMIENTO
      },
      encabezado: {
        serie: datosFelCertificados?.SERIE_FACTURA_FEL ?? '',
        numero: datosFelCertificados?.NUMERO_FACTURA_FEL ?? '',
        uuid: datosFelCertificados?.UUID ?? '',
        numeroInterno: `${factura?.SERIE ?? ''} | ${factura?.NUMERO_FACTURA ?? ''}`,
        fechaEmision: fechaEmisionValida,
        tipoDocumento: 'FACTURA ELECTRONICA'
      },
      cliente: {
        nombre: factura.NOMBRE_CLI_A_FACTUAR,
        nit: factura.NIT_CLIEN_A_FACTURAR,
        direccion: factura.DIRECCION_CLI_FACTUR
      },
      items: itemsFactura,
      resumen: {
        subtotal: `Q. ${factura.TOTAL_GENERAL.toFixed(2)}`,
        descuento: `Q ${factura.MONTO_DESCUENTO_FACT.toFixed(2)}`,
        totalPagar: `Q. ${factura.TOTAL_GENERAL.toFixed(2)}`,
        totalItems: totalItems
      },
      nombreVendedor: factura.USUARIO_QUE_FACTURA || 'Desconocido',
      qrCodeData: 'Pendiente'
    }

    // Generar PDF
    await generarFacturaPDF(dataFactura)

  } catch (error) {
    console.error('Error reimprimiendo factura:', error)
    showErrorNotification('Error al reimprimir factura', 'Error')
  }
}


</script>

<style scoped>

.page-header {
  padding: 8px 0;
}

.search-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.search-input {
  border-radius: 6px;
}

.result-chip {
  border-radius: 16px;
  font-size: 0.75rem;
}

.factura-card {
  transition: all 0.2s ease;
  border-radius: 8px;
  border: 2px solid #fff3c4;
  height: auto;
  margin: 2px 0 10px 0; 
  cursor: pointer;
}

.factura-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #ffc107;
}

.card-header {
  background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
  border-bottom: 1px solid #f5f5f5;
}

.cliente-section {
  background-color: #fafafa;
  padding: 8px;
  border-radius: 4px;
  border-left: 2px solid #ffc107;
}

.client-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  max-height: 2.4em;
  text-overflow: ellipsis;
  white-space: normal;
}

.total-section {
  background-color: #f1f8e9;
  padding: 6px 4px;
  border-radius: 4px;
}

.action-btn {
  border-radius: 4px;
  transition: all 0.2s ease;
  margin: 8px;
}

.action-btn:hover {
  background-color: rgba(255, 193, 7, 0.1);
}

.empty-state {
  margin-top: 2rem;
}

.modal-header {
  background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
  border-bottom: 1px solid #f5f5f5;
}

.produto-card {
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  border-left: 3px solid #ffc107;
}

.produto-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-btn {
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Responsive mejorado */
@media (max-width: 1920px) {
  .col-xl-2 {
    width: 16.66%;
  }
}

.fecha-factura {
  min-height: 20px; 
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1200px) {
  .col-lg-3 {
    width: 25%;
  }
}

@media (max-width: 768px) {
  .factura-card {
    height: auto;
    min-height: 200px;
  }
  
  .page-header .text-h5 {
    font-size: 1.25rem;
  }
}

</style>