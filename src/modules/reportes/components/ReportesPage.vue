<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-md">
      <div class="text-h6 text-primary">Reportes del Sistema</div>

      <q-separator class="q-my-md" />

      <q-card-section>
        <q-btn
          color="primary"
          icon="bar_chart"
          label="Generar Reporte de Ventas"
          class="q-mb-sm"
          @click="generarReporte('ventas')"
        />
        <q-btn
          color="secondary"
          icon="trending_up"
          label="Reporte de Productos Más Vendidos"
          class="q-mb-sm"
          @click="generarReporte('productos')"
        />
        <q-btn
          color="accent"
          icon="assessment"
          label="Reporte de Clientes Frecuentes"
          class="q-mb-sm"
          @click="generarReporte('clientes')"
        />
      </q-card-section>

      <q-banner v-if="mensaje" class="q-mt-md bg-grey-2 text-primary">
        {{ mensaje }}
      </q-banner>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mensaje = ref('')

function generarReporte(tipo: string) {
  mensaje.value = `Generando reporte de ${tipo}... (No se apura Hugo)`
}
</script>

<style scoped>
.q-btn {
  width: 100%;
  max-width: 400px;
}
</style>
