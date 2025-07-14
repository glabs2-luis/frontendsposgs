<template>
  <q-layout view="lHh Lpr lFf">

    <!-- Menu side bar -->
    <q-drawer v-model="menuAbierto" bordered :width="250" class="drawer-elegante">
      <q-list padding>

        <q-item clickable v-ripple @click="router.push('/ventas')">
          <q-item-section avatar><q-icon name="point_of_sale" /></q-item-section>
          <q-item-section>Ventas </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="router.push('/clientes')" >
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="router.push('/facturas')" >
          <q-item-section avatar><q-icon name="description" /></q-item-section>
          <q-item-section>Facturas</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="router.push('/notas')">
          <q-item-section avatar><q-icon name="edit_note" /></q-item-section>
          <q-item-section>Notas de Crédito</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="router.push('/reportes')">
          <q-item-section avatar><q-icon name="bar_chart" /></q-item-section>
          <q-item-section>Reportes</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="router.push('/configuracion')">
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Configuracion</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <!-- Barra superior -->
    <q-header elevated class="barra-principal text-dark shadow-2" height-hint="60">
      <q-toolbar>

        <!-- botón hamburguesa menú -->
        <q-btn flat dense round icon="menu" @click="menuAbierto = !menuAbierto" class="q-mr-sm" />
        <q-toolbar-title>
          POS GS - {{obtenerSucursal?.NOMBRE_DE_SUCURSAL}}
        </q-toolbar-title>

        <div class="q-mr-md text-weight-medium">
          <div v-if="!configuracionStore.serieSeleccionada || configuracionStore.serieSeleccionada === '0'" class="text-negative">
            No hay serie para facturación
          </div>
          <div v-else>
            {{ configuracionStore.serieSeleccionada }}
          </div>
        </div>

        <div class="q-mr-md text-weight-medium">
        {{ nombreVendedor }}
        </div>

        <q-btn flat icon="logout" label="" class="q-ml-sm" color="negative"
        @click="cerrarSesion" />

      </q-toolbar>
    </q-header>

    <!-- Paginas -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/user'
import { useSucursales} from '@/modules/Sucursales/composables/useSucursales'
import { useConfiguracionStore } from '@/stores/serie'

const { obtenerSucursal } = useSucursales()
const { nombreVendedor, codigoVendedor } = useUserStore()
const router = useRouter()
const route = useRoute()
const menuAbierto = ref(false)
const configuracionStore = useConfiguracionStore()

const cerrarSesion = async () => {

  localStorage.removeItem('token')

  Swal.fire({
  title: "Cerrar Sesión",
  text: "Estas seguro que deseas salir?",
  icon: "warning",
  showCancelButton: true,
  cancelButtonText: "Cancelar",
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Si, Cerrar Sesion"
}).then((result) => {
  if (result.isConfirmed) {
      router.push('/login')
  }
})

}


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
