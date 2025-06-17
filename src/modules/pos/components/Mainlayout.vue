<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Menu side bar -->
    <q-drawer v-model="menuAbierto" bordered :width="250" class="drawer-elegante">
      <q-list padding>
        <q-item clickable v-ripple to="/ventas">
          <q-item-section avatar><q-icon name="point_of_sale" /></q-item-section>
          <q-item-section>Ventas</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/clientes">
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/facturas">
          <q-item-section avatar><q-icon name="description" /></q-item-section>
          <q-item-section>Facturas</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/notas">
          <q-item-section avatar><q-icon name="edit_note" /></q-item-section>
          <q-item-section>Notas de Crédito</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/reportes">
          <q-item-section avatar><q-icon name="bar_chart" /></q-item-section>
          <q-item-section>Reportes</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Barra superior -->
    <q-header elevated class="barra-principal text-dark shadow-2" height-hint="60">
      <q-toolbar>
        <!-- botón hamburguesa menú -->
        <q-btn flat dense round icon="menu" @click="menuAbierto = !menuAbierto" class="q-mr-sm" />
        <q-toolbar-title>
          POS GS - Sucursal Huehue
        </q-toolbar-title>
        <div class="q-mr-md text-weight-medium">
          Nombre del usuario
        </div>
      </q-toolbar>
    </q-header>

    <!-- Contenido de las páginas -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const menuAbierto = ref(false)
</script>

<style scoped>
.barra-principal {
  background: linear-gradient(90deg, #FFEB3B, #FBC02D);
}
.drawer-elegante {
  background: linear-gradient(to bottom, #FFFDE7, #FFF8E1);
  border-right: 1px solid #FDD835;
}
.q-item {
  border-radius: 6px;
  transition: background 0.2s ease-in-out;
}
.q-item:hover {
  background: #FFF9C4;
}
</style>
