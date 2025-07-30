<template>

    <q-page class="q-pa-xs">

        <q-card class="q-pa-md q-ma-md">

        <q-section class="q-pa-xs text-h6" color="primary" >
            Facturas Pendientes

        <q-table :rows="facturasPendientes" :columns="columnasPendientes" row-key="id" flat bordered dense >

        <!-- No hay datos-->
         <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg">
                <q-icon name="inventory_2" size="64px" color="grey-8" />
                <div class="text-subtitle1 q-mt-sm text-gray-7">
                    No hay Facturas Pendientes
                </div>
                <div class="text-caption text-gray-5">
                    Todas las facturas ya fueron certificadas
                </div>
            </div>
         </template>

        </q-table>

        </q-section>
    
        </q-card>
    
        <q-separator></q-separator>
        
        <q-card class="q-pa-md q-pt-xs q-ma-md">

        
        <q-section class="q-pa-xs text-h6 " color="primary">
            Facturas con Error


        <q-table :rows="facturasConErrores" :columns="columnasErrores" row-key="id" flat bordered dense >

             <!-- No hay datos-->
         <template v-slot:no-data>
            <div class="full-width text-center q-pa-lg">
                <q-icon name="inventory_2" size="64px" color="grey-8" />
                <div class="text-subtitle1 q-mt-sm text-gray-7">
                    No hay Facturas Con Error
                </div>
                <div class="text-caption text-gray-5">
                    Todas las facturas ya fueron certificadas
                </div>
            </div>
         </template>

        </q-table>

        </q-section>

        </q-card>


    </q-page>

</template>

<script setup lang="ts">

import { ref, onMounted, computed, reactive } from 'vue'
import { QTableColumn } from 'quasar'
import { useFacturasFel } from '../composables/useFelPendientes'

const { facturasErrores } = useFacturasFel()


const formatearFecha = (fechaISO: string) => {
  const fecha = new Date(fechaISO)
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(fecha)
}

// Datos de ejemplo
const facturasPendientes = ref([

])

// Esta es la forma correcta de usar la data
const facturasConErrores = computed(() => facturasErrores.value || [])

// Columnas para tabla 1
const columnasPendientes: QTableColumn[] = [
  { name: 'serie', label: 'Serie', field: 'serie', align: 'left' },
  { name: 'numero', label: 'Número', field: 'numero', align: 'left' },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' }
]

// Columnas para tabla 2
const columnasErrores: QTableColumn[] = [
  { name: 'numero', label: 'Numero de Factura', field: 'NUMERO_FACTURA', align: 'left',  },
  { name: 'serie', label: 'Serie', field: 'SERIE', align: 'left' },
  { name: 'error', label: 'Mensaje de Error', field: 'ERROR', align: 'left' },
  { name: 'Fecha', label: 'Fecha de Facturación', field: 'FECHA_FACTURACION', align: 'left', format: (val: string) => formatearFecha(val) } 
]


</script>

<style scoped>



</style>