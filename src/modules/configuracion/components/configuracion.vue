<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <div class="text-h6 text-primary">Configuracion del Sistema</div>

      <q-separator class="q-my-md" />

    <q-card-section>

        <q-select v-model="serie" :options="seriesOptions" label="Seleccionar Serie" option-label="SERIE" option-value="SERIE" emit-value map-options @update:model-value="guardarSerieSeleccionada" dense filled
        />
        <q-banner class="q-mt-md bg-grey-2 text-dark" rounded>
        Serie activa: <strong>{{ configuracionStore.serieSeleccionada }}</strong>
        </q-banner>

    </q-card-section>


    <!-- Mas configuraciones -->


    </q-card>
  </q-page>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import useSeries from '../../fel_establecimiento_series/composables/useSeries'
import { useConfiguracionStore } from '@/stores/serie'
import { showConfirmationDialog } from '@/common/helper/notification'

// Store
const configuracionStore = useConfiguracionStore()
const { seriesSucursal } = useSeries()

// Parámetros
const idSucursal = ref(1)
const serie = ref(configuracionStore.serieSeleccionada || '')

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

</script>


<style scoped>

</style>