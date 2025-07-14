<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <div class="text-h6 text-indigo-10">Historial de Facturas</div>

      <q-separator class="q-my-md" />

      <q-input v-model="filtro" label="Buscar por cliente o número" dense filled debounce="300" class="q-mb-md"
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-list bordered separator v-if="facturasFiltradas.length">
        <q-item v-for="factura in facturasFiltradas" :key="factura.ID_FACTURA_ENC">
          <q-item-section>
            <q-item-label class="text-bold">Factura: {{ factura.NUMERO_FACTURA }}</q-item-label>
            <q-item-label>Cliente: {{ factura.NOMBRE_CLI_A_FACTUAR }}</q-item-label>
            <q-item-label> Q {{ factura.TOTAL_GENERAL.toFixed(2) }}</q-item-label>
            <q-item-label>Fecha: {{ formatearFecha(factura.FECHA_DE_FACTURA) }}</q-item-label>
          </q-item-section>

          <!-- boton para reimprimir -->
          <q-item-section>
            <q-btn dense flat icon="receipt" color="primary" click="" label="Reimprimir factura"  />            
          </q-item-section>

          <!-- Mostrar detalle-->
          <q-item-section side>
            <q-btn dense flat icon="visibility" color="primary" @click="verDetalleFactura(factura.ID_FACTURA_ENC)" />
          </q-item-section>

        </q-item>
      </q-list>

      <div v-else class="text-grey text-center q-mt-md">No hay facturas encontradas</div>
    </q-card>

    <!-- Detalle de la Factura  -->
    <q-dialog v-model="mostrarDetalle" persistent>
      <q-card style="min-width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Detalle de Factura</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-list v-if="detalleFactura.length">
            <q-item v-for="(item, index) in detalleFactura" :key="index">
              <q-item-section>
                <q-item-label><b>Producto:</b> {{ item.PRODUCT0.trim() }}</q-item-label>
                <q-item-label caption>Cantidad: {{ item.CANTIDAD_VENDIDA }}</q-item-label>
                <q-item-label caption>Precio: Q {{ Number(item.PRECIO_UNITARIO_VTA).toFixed(2) }}</q-item-label>
                <q-item-label caption>Subtotal: Q {{ Number(item.SUBTOTAL_GENERAL).toFixed(2) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="text-center text-grey q-mt-md">
            No hay productos en esta factura
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>


<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import useFacturasEnc from '../../facturas_enc/composables/useFacturasEnc'

const filtro = ref('')
const mostrarDetalle = ref(false)
const detalleFactura = ref<any[]>([])
const idSeleccionado = ref<number | null>(null)

const { obtenerFacturasEnc, obtenerDetalleFactura } = useFacturasEnc()
const { data: facturasData, isLoading } = obtenerFacturasEnc()


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

</script>

<style scoped >

</style>
