<template>

  <q-page class="q-pa-md">

    <!-- Título -->
    <q-section flat bordered class="q-pa-md q-ml-lg">
      <div class="text-h6 text-primary text-bold" color="primary">
      Configuracion del Sistema
      </div>
    </q-section>

    <!-- Cambiar Serie de Facturación -->
    <q-card flat bordered class="q-pa-md">
    <q-expansion-item flat bordered class="text-h6 text-black prueba" icon="compare_arrows" label="Cambiar Serie de Facturación" >

      <q-separator class="q-my-md" />

    <q-card-section>
        <q-select v-model="serie" :options="seriesOptions" label="Seleccionar Serie" option-label="SERIE" option-value="SERIE" emit-value map-options @update:model-value="guardarSerieSeleccionada" dense filled
        />
        <q-banner class="q-mt-md bg-grey-2 text-dark" rounded>
        Serie activa: <strong>{{ configuracionStore.serieSeleccionada }}</strong>
        </q-banner>
      </q-card-section>
    </q-expansion-item>

  </q-card>


    <!-- Sincronizar Facturas -->
  <q-card flat bordered class="q-pa-md q-mt-md">
    <q-expansion-item icon="sync" flat bordered class="text-h6 text-black prueba" label="Sincronizar Facturas">
      <q-separator class="q-my-md" />
        <q-banner class="bg-grey-2 text-dark q-pa-xs q-ma-md" rounded>
        Facturas sin enviar: <strong> {{ archivosErrores?.count }} </strong> <br>
        Última revisión: <strong>
        {{ new Date(archivosErrores?.timestamp).toLocaleString('es-GT') }} </strong>
        </q-banner>
          <q-btn class="q-ma-md" color="primary" icon="sync" label="Sincronizar" @click="reintentarEnviarArchivos()"    />
        <q-btn class="q-ma-md" color="secondary" icon="information" @click="mostrarConexion" />

    </q-expansion-item>

  </q-card>

  <!-- Mensaje de conexión -->
    <q-dialog v-model="conexionMensaje" persistent>
      <q-card>
        <q-card-section class="text-h6 text-primary">
          Estado de la conexión
          <q-btn flat icon="close" v-close-popup class="float-right" />
        </q-card-section>
        <q-card-section>
          <p><strong> Estado: {{ estadoConexion.serverConnected }}</strong></p>
        </q-card-section>

      </q-card>
    </q-dialog>

      <!-- shortcuts -->

        <q-card flat bordered class="q-pa-md q-mt-md">
          <q-expansion-item class="text-h6 text-black prueba" icon="keyboard_alt" label="Mostrar Atajos de Teclado" dense-toggle expand-icon="keyboard_arrow_down"  header-class="text-black"
          >
            <q-markup-table flat bordered class="q-mt-md">
              <thead>
                <tr>
                  <th class="text-left"><strong>Tecla</strong></th>
                  <th class="text-left"><strong>Acción a Realizar</strong></th>
                </tr>
              </thead>
              <tbody>

                <tr>
                  <td><kbd><strong>F2</strong></kbd></td>
                  <td>Consumidor Final (CF)</td>
                </tr>

                <tr>
                  <td><kbd><strong>Delete</strong></kbd></td>
                  <td>Limpiar pedido actual</td>
                </tr>
                
                <tr>
                  <td><kbd><strong>*</strong></kbd></td>
                  <td>Cambiar Cantidad de productos</td>
                </tr>

                <tr>
                  <td><kbd><strong>Enter</strong></kbd></td>
                  <td>Confirmar cantidad y cerrar ventana</td>
                </tr>

                <tr>
                  <td><kbd><strong>F4</strong></kbd></td>
                  <td>Facturar</td>
                </tr>
                
                <tr>
                  <td><kbd><strong>-</strong></kbd></td>
                  <td>Pedidos Pendientes</td>
                </tr>

                <tr>
                  <td><kbd><strong>F3</strong></kbd></td>
                  <td>Crear Pedido</td>
                </tr>

              </tbody>
            </q-markup-table>
          </q-expansion-item>
        </q-card>

    
      <!-- Mas configuraciones -->


      <q-page class="q-mt-lg">
        <q-btn label="Imprimir" color="green" @click="probarFactura" />
      </q-page>

  </q-page>
</template>


<script setup lang="ts">

import { ref, watch, computed } from 'vue'
import useSeries from '../../fel_establecimiento_series/composables/useSeries'
import { useConfiguracionStore } from '@/stores/serie'
import { showConfirmationDialog } from '@/common/helper/notification'

import { DataFactura } from '@/modules/facturar_pdf/interfaces/pdfInterface'
import { usePdfFactura } from '@/modules/facturar_pdf/composables/usePdFactura'
const { generarFacturaPDF } = usePdfFactura()
// Store
const configuracionStore = useConfiguracionStore()
const { seriesSucursal } = useSeries()


// sync
import { useSync } from '@/modules/sync/composables/useSync'
const { refetchArchivosCreados, archivosTransferidos, refetchArchivosTransferidos, refetchArchivosErrores, reintentarEnviarArchivos, archivosErrores, estadoConexion } = useSync()

// Parámetros
const idSucursal = ref(1)
const serie = ref(configuracionStore.serieSeleccionada || '')
const conexionMensaje = ref(false)

const { data: series, isLoading, error } = seriesSucursal(idSucursal.value)


const seriesOptions = computed(() => {
  return series.value?.map((item: any) => item.SERIE) || []
})

// Guardar selección en el store
const guardarSerieSeleccionada = async (valor: string) => {
  const confirmado = await showConfirmationDialog(
    'Serie',
    '¿Está seguro que desea actualizar la serie?'
  )

  if (confirmado) {
    configuracionStore.setSerieSeleccionada(valor)
  }
}

// mostrar la conexion de la base de datos
const mostrarConexion = () => {
  conexionMensaje.value = true
}


const probarFactura = () => {
  const dataFactura: DataFactura = {
    encabezado: {
      serie: "A",
      numero: "000123",
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      numeroInterno: "FAC-00123"
    },
    cliente: {
      nombre: "Juan Pérez",
      nit: "1234567-8",
      direccion: "5a Avenida 10-25 Zona 1, Ciudad de Guatemala"
    },
    items: [
      {
        cantidad: 2,
        descripcion: "Camisa Polo Azul",
        precio: "Q100.00",
        subtotal: "Q200.00"
      },
      {
        cantidad: 1,
        descripcion: "Pantalón Jeans",
        precio: "Q150.00",
        subtotal: "Q150.00"
      }
    ],
    resumen: {
      subtotal: "Q350.00",
      descuento: "Q0.00",
      totalPagar: "Q350.00",
      totalItems: 3
    },
    nombreVendedor: "Carlos Ramírez",
    qrCodeData: "https://midominio.com/factura/000123"
  };

  generarFacturaPDF(dataFactura);
};






function ListaDet1(idPedidoEnc: any): { data: any; isLoading: any; refetch: any } {
  throw new Error('Function not implemented.')
}
</script>


<style scoped>

.prueba {

  color: #212121; 
  border-radius: 8px;
  border: 1px solid #faf9b8; 
  transition: all 0.3s ease;
  margin-bottom: 0;
  padding: 0 0 0 0;
}


</style>