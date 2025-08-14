<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">

      <!-- Tabla de facturas pendientes -->
      <div class="col">
        <q-card class="q-pa-md">
          <q-section class="q-pa-xs q-ma-none">

            <div class="row items-center justify-between q-mb-sm">

              <div class="text-h6 ">Facturas Pendientes</div>

              <div class="row q-gutter-sm">
                <q-btn
                icon="refresh"
                label=""
                color="cyan"
                @click="Refrescar"
              />

              <q-btn
                label="Certificar"
                color="primary"
                @click="certificarAgain"
              />
              </div>
            </div>
            

            <q-table
              :rows="facturasPendientes"
              :columns="columnasPendientes"
              :row-key="row => `${row.NUMERO_FACTURA}-${row.SERIE}`"
              flat
              bordered
              dense
              :pagination="{ rowsPerPage: 20 }"
              :rows-per-page-options="[10, 20, 50, 100]"
              style="height: 600px"
              virtual-scroll
              selection="single"
              v-model:selected="facturaSeleccionadaArray"
            >
              <template v-slot:no-data>
                <div class="full-width text-center" style="padding: 200px 20px;">
                  <q-icon name="inventory_2" size="64px" color="grey-8" />
                  <div class="text-subtitle1 q-mt-sm text-grey-7">
                    No hay Facturas Pendientes
                  </div>
                  <div class="text-caption text-grey-5">
                    Todas las facturas ya fueron certificadas
                  </div>
                </div>
              </template>
            </q-table>
          </q-section>
        </q-card>
      </div>

      <!-- Tabla de errores -->
      <div class="col">
        <q-card class="q-pa-md q-pt-xs">
          <q-section class="q-pa-xs text-h6">
            Errores

            <q-table
              :rows="facturasConErrores"
              :columns="columnasErrores"
              :row-key="row => `${row.NUMERO_FACTURA}-${row.SERIE}`"
              flat
              bordered
              dense
              :pagination="{ rowsPerPage: 20 }"
              :rows-per-page-options="[10, 20, 50, 100]"
              style="height: 600px"
              virtual-scroll
            >
                <template v-slot:no-data>
                <div class="full-width text-center" style="padding: 200px 20px;">
                  <q-icon name="inventory_2" size="64px" color="grey-8" />
                  <div class="text-subtitle1 q-mt-sm text-grey-7">
                    Seleccione una Factura
                  </div>
                  <div class="text-caption text-grey-5">
                    Para ver los errores
                  </div>
                </div>
              </template>
            </q-table>
            
          </q-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">

import { ref, computed, watch, nextTick } from 'vue'
import { QTableColumn } from 'quasar'
import { useFacturasFel } from '../composables/useFelPendientes'
import { useCertification } from '@/modules/certification/composables/useCertification'
import { runWithLoading, showErrorNotification, showSuccessNotification } from '@/common/helper/notification'
import { useStoreSucursal } from '@/stores/sucursal'

const storeSucursal = useStoreSucursal();
const { mutateCertificar } = useCertification()
const { facturasErrores, refetchFacturasErrores } = useFacturasFel()
const facturaSeleccionadaArray = ref([])
const facturaSeleccionada = ref<string | null>(null)

// Observa la factura seleccionada
watch(facturaSeleccionadaArray, (newSelection) => {
  if (newSelection.length > 0) {
    const factura = newSelection[0]
    facturaSeleccionada.value = `${factura.NUMERO_FACTURA}-${factura.SERIE}`
  } else {
    facturaSeleccionada.value = null
  }
})

// Formato de fecha
const formatearFecha = (fechaISO: string) => {
  const fecha = new Date(fechaISO)
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fecha)
}

// Agrupar facturas únicas (por número y serie)
const facturasPendientes = computed(() => {
  const unicas: Record<string, any> = {}
  facturasErrores.value?.forEach((factura) => {
    const key = `${factura.NUMERO_FACTURA}-${factura.SERIE}`
    if (!unicas[key]) {
      unicas[key] = factura
    }
  })
  return Object.values(unicas)
})

// Filtrar errores según la factura seleccionada
const facturasConErrores = computed(() => {
  if (!facturaSeleccionada.value) return []

  const [numeroSel, serieSel] = facturaSeleccionada.value.split('-')

  return facturasErrores.value?.filter(factura =>
    String(factura.NUMERO_FACTURA).trim() === numeroSel &&
    String(factura.SERIE).trim() === serieSel
  ) || []
})

// Intentar certificar 
const certificarAgain = async () => {

    if(facturaSeleccionada.value === null){
      showErrorNotification('Seleccione una Factura', 'Debe de seleccionar una factura')
      return
    }

    const [numero, serie] = facturaSeleccionada.value.split('-')  
    const numero2= Number(numero)

    await runWithLoading( async () =>  await mutateCertificar(
  { sucursal: storeSucursal.idSucursal, serie, numero: numero2 },
  {
    onSuccess: async (data) => {

    if(data.CertificadoFel === false) {
        showErrorNotification('Error', 'La factura no pudo ser certificada')
    }  else {
        showSuccessNotification('Certificado', 'Factura fue certificada con exito')
        await nextTick()
         await refetchFacturasErrores() 
    }
  }

  } ), 'Certificando')
}

// Recargar el error
const Refrescar = async () =>{
  await runWithLoading ( async () =>  await refetchFacturasErrores(), 'Refrescando Facturas' )
}

// tabla pendientes - izquierda
const columnasPendientes: QTableColumn[] = [
  { name: 'numero', label: 'Número', field: 'NUMERO_FACTURA', align: 'left' },
  { name: 'serie', label: 'Serie', field: 'SERIE', align: 'left' },
  { name: 'Fecha', label: 'Fecha Facturación', field: 'FECHA_FACTURACION', align: 'left', format: formatearFecha }
]

// tabla  derecha
const columnasErrores: QTableColumn[] = [
  { name: 'numero', label: 'No.', field: 'NUMERO_FACTURA', align: 'left' },
  { name: 'error', label: 'Mensaje de Error', field: 'ERROR', align: 'left' }
]

</script>

<style scoped>

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

</style>
