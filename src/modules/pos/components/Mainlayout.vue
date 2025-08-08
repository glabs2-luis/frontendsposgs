<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Menu side bar -->
    <q-drawer
      v-model="menuAbierto"
      bordered
      :width="250"
      class="drawer-elegante"
    >
      <q-list padding>
        <q-item clickable v-ripple @click="router.push('/ventas')">
          <q-item-section avatar
            ><q-icon name="point_of_sale"
          /></q-item-section>
          <q-item-section>Ventas </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="router.push('/clientes')">
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="router.push('/facturas')">
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

        <q-item clickable v-ripple @click="router.push('/pendientes')">
          <q-item-section avatar><q-icon name="schedule" /></q-item-section>
          <q-item-section>Pendientes</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Barra superior -->
    <q-header
      elevated
      class="barra-principal text-dark shadow-2"
      height-hint="60"
    >
      <q-toolbar>
        <!-- botón hamburguesa menú -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="menuAbierto = !menuAbierto"
          class="q-mr-sm"
        />
        <q-toolbar-title>
          POS GS - {{ obtenerSucursal?.NOMBRE_DE_SUCURSAL }}
        </q-toolbar-title>

        <div class="q-mr-md text-weight-medium">
          <div
            v-if="
              !configuracionStore.serieSeleccionada ||
              configuracionStore.serieSeleccionada === '0'
            "
            class="text-negative"
          >
            No hay serie para facturación
          </div>
          <div v-else>
            {{ configuracionStore.serieSeleccionada }}
          </div>
        </div>

        <div class="q-mr-md text-weight-medium">
          {{ nombreVendedor }}
        </div>

        <!-- Botón de sincronización -->
        <q-btn
          flat
          round
          dense
          :icon="isSyncing ? 'sync' : 'sync'"
          :class="isSyncing ? 'rotating' : ''"
          :color="isSyncing ? 'primary' : 'grey-7'"
          class="q-mr-sm sync-button"
          @click="abrirModalSincronizacion"
          :disable="isSyncing"
        >
          <!-- Badge de notificaciones -->
          <q-badge
            v-if="notificacionesCount > 0"
            :label="notificacionesCount"
            :color="badgeColor"
            floating
            class="sync-notification-badge"
          >
            <q-icon
              v-if="failedTasks.length > 0"
              name="error"
              size="10px"
              class="q-mr-xs"
            />
          </q-badge>
          <q-tooltip>
            <div v-if="isSyncing">Sincronizando...</div>
            <div v-else>
              <div class="text-weight-medium">Sincronización</div>
              <div v-if="notificacionesCount > 0" class="text-caption">
                {{ notificacionesCount }} notificación{{
                  notificacionesCount > 1 ? "es" : ""
                }}
                pendiente{{ notificacionesCount > 1 ? "s" : "" }}
              </div>
              <div v-else class="text-caption">Todo actualizado</div>
            </div>
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          icon="logout"
          label=""
          class="q-ml-sm"
          color="negative"
          @click="cerrarSesion"
        />
      </q-toolbar>
    </q-header>

    <!-- Paginas -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
      <div class="bg-yellow-8 text-black text-center q-pa-sm">
        <strong> Made by Hugo Boss - 2025 </strong>
      </div>
    </q-footer>

    <!-- Modal de resultados de sincronización -->
    <SyncResultsModal
      v-model:show="showModal"
      :results="syncResults"
      :tasks="syncTasks"
      :is-syncing="isSyncing"
      @execute-all="executeAllTasks"
      @execute-single="executeSingleTask"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
import { useSucursales } from "@/modules/Sucursales/composables/useSucursales";
import { useConfiguracionStore } from "@/stores/serie";
import { cleanAllStores } from "@/common/helper/cleanStore";
import { useQuasar } from "quasar";
import { useSyncManager } from "@/modules/sync/composables/useSyncManager";
import SyncResultsModal from "@/modules/sync/components/SyncResultsModal.vue";

const { obtenerSucursal } = useSucursales();
const { nombreVendedor, codigoVendedor } = useUserStore();
const router = useRouter();
const route = useRoute();
const menuAbierto = ref(false);
const configuracionStore = useConfiguracionStore();
const $q = useQuasar();

// Usar el nuevo sistema de sincronización
const {
  isSyncing,
  syncResults,
  showModal,
  syncTasks,
  runningTasks,
  completedTasks,
  failedTasks,
  executeAllTasks,
  executeSingleTask,
  showResults,
  formatDate,
  loadLastSyncDates,
} = useSyncManager();

// Variables para sincronización automática (mantener compatibilidad)
const ultimaSincronizacion = ref<Date | null>(null);
const intervaloAutomatico = ref<number | null>(null);

// Computed property para contar notificaciones
const notificacionesCount = computed(() => {
  let count = 0;

  // Contar tareas con errores (prioridad alta)
  count += failedTasks.value.length;

  // Contar tareas que nunca se han sincronizado (solo si no están ejecutándose)
  count += syncTasks.value.filter(
    (task) => !task.lastSync && !task.isRunning
  ).length;

  // Contar resultados recientes con errores (últimas 24 horas)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  count += syncResults.value.filter(
    (result) => !result.success && result.timestamp > last24Hours
  ).length;

  // Contar tareas que no se han sincronizado en más de 1 hora
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);
  count += syncTasks.value.filter(
    (task) => task.lastSync && task.lastSync < lastHour && !task.isRunning
  ).length;

  return count;
});

// Computed property para el color del badge
const badgeColor = computed(() => {
  const errorCount = failedTasks.value.length;
  const pendingCount = syncTasks.value.filter(
    (task) => !task.lastSync && !task.isRunning
  ).length;
  const oldSyncCount = syncTasks.value.filter((task) => {
    if (!task.lastSync || task.isRunning) return false;
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    return task.lastSync < lastHour;
  }).length;

  if (errorCount > 0) return "negative"; // Rojo para errores
  if (pendingCount > 0) return "warning"; // Naranja para pendientes
  if (oldSyncCount > 0) return "info"; // Azul para sincronizaciones antiguas
  return "positive"; // Verde para todo bien
});

// Función para abrir modal de sincronización
const abrirModalSincronizacion = () => {
  showModal.value = true;
  // Limpiar notificaciones al abrir el modal
  limpiarNotificaciones();
};

// Función para limpiar notificaciones
const limpiarNotificaciones = () => {
  // Limpiar errores de tareas cuando se abre el modal
  syncTasks.value.forEach((task) => {
    if (task.error) {
      task.error = null;
    }
  });

  // Limpiar resultados antiguos (más de 24 horas)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  syncResults.value = syncResults.value.filter(
    (result) => result.timestamp > last24Hours
  );
};

// Función para iniciar sincronización automática
const iniciarSincronizacionAutomatica = () => {
  // solo cambiar el 1 por otro numero para indicar los minutos de intervalo de sincronizacion, para nop hacerce bolas
  const intervalo = 1 * 60 * 1000;

  // Primera sincronización si no hay registro previo
  if (syncTasks.value.every((task) => !task.lastSync)) {
    setTimeout(async () => {
      if (!isSyncing.value) {
        console.log("Iniciando primera sincronización automática...");
        await executeAllTasks();
      }
    }, 5000);
  }

  intervaloAutomatico.value = window.setInterval(async () => {
    if (!isSyncing.value) {
      console.log("Ejecutando sincronización automática...");
      await executeAllTasks();
    }
  }, intervalo);
};

// Función para detener sincronización automática
const detenerSincronizacionAutomatica = () => {
  if (intervaloAutomatico.value) {
    clearInterval(intervaloAutomatico.value);
    intervaloAutomatico.value = null;
    console.log("Sincronización automática detenida");
  }
};

// Cargar última sincronización y iniciar automática
onMounted(() => {
  // Cargar fechas de última sincronización
  loadLastSyncDates();

  // Iniciar sincronización automática
  iniciarSincronizacionAutomatica();
});

// Limpiar intervalo al desmontar el componente
onBeforeUnmount(() => {
  detenerSincronizacionAutomatica();
});

const cerrarSesion = async () => {
  Swal.fire({
    title: "Cerrar Sesión",
    text: "Estas seguro que deseas salir?",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, Cerrar Sesion",
  }).then((result) => {
    if (result.isConfirmed) {
      router.push("/login");
      localStorage.removeItem("token");
      cleanAllStores();
    }
  });
};
</script>

<style scoped>
.barra-principal {
  background: linear-gradient(90deg, #ffeb3b, #fbc02d);
}
.drawer-elegante {
  background: linear-gradient(to bottom, #fffde7, #fff8e1);
  border-right: 1px solid #fdd835;
}
.q-item {
  border-radius: 6px;
  transition: background 0.2s ease-in-out;
}
.q-item:hover {
  background: #fff9c4;
}

/* Animación de rotación para el icono de sincronización */
.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Estilos para el botón de sincronización con notificaciones */
.sync-button {
  position: relative;
}

.sync-notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  animation: pulse-notification 2s infinite;
  z-index: 1000;
}

@keyframes pulse-notification {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* Estilos específicos para diferentes colores de badge */
.sync-notification-badge.bg-negative {
  animation: pulse-notification-red 2s infinite;
}

.sync-notification-badge.bg-warning {
  animation: pulse-notification-orange 2s infinite;
}

.sync-notification-badge.bg-positive {
  animation: pulse-notification-green 2s infinite;
}

.sync-notification-badge.bg-info {
  animation: pulse-notification-blue 2s infinite;
}

@keyframes pulse-notification-red {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

@keyframes pulse-notification-orange {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
}

@keyframes pulse-notification-green {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

@keyframes pulse-notification-blue {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

/* Estilos para el separador */
.q-separator {
  background: #fdd835;
  opacity: 0.3;
}
</style>
