import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import {
  updateCodigosBarraAction,
  updateCuponesDetAction,
  updateCuponesEncAction,
  updatePreciosAction,
  updateProductosAction,
  updateVendedoresAction,
} from "../action";

export interface SyncTask {
  id: string;
  name: string;
  description: string;
  action: () => Promise<void>;
  lastSync: Date | null;
  isRunning: boolean;
  error: string | null;
}

export interface SyncResult {
  taskId: string;
  success: boolean;
  message: string;
  timestamp: Date;
}

export const useSyncManager = () => {
  const $q = useQuasar();

  // Estado de sincronización
  const isSyncing = ref(false);
  const syncResults = ref<SyncResult[]>([]);
  const showModal = ref(false);

  // Tareas de sincronización
  const syncTasks = ref<SyncTask[]>([
    {
      id: "precios",
      name: "Precios",
      description: "Sincronizar precios actualizados",
      action: updatePreciosAction,
      lastSync: null,
      isRunning: false,
      error: null,
    },
    {
      id: "productos",
      name: "Productos",
      description: "Sincronizar catálogo de productos",
      action: updateProductosAction,
      lastSync: null,
      isRunning: false,
      error: null,
    },
    {
      id: "codigos-barra",
      name: "Codigos de Barra",
      description: "Sincronizar codigos de barra actualizados",
      action: updateCodigosBarraAction,
      lastSync: null,
      isRunning: false,
      error: null,
    },
    {
      id: "cupones-enc",
      name: "Cupones de Encabezado",
      description: "Sincronizar cupones de encabezado actualizados",
      action: updateCuponesEncAction,
      lastSync: null,
      isRunning: false,
      error: null,
    },
    {
      id: "cupones-det",
      name: "Cupones de Detalle",
      description: "Sincronizar cupones de detalle actualizados",
      action: updateCuponesDetAction,
      lastSync: null,
      isRunning: false,
      error: null,
    },
    {
      id: "vendedores",
      name: "Vendedores",
      description: "Sincronizar vendedores actualizados",
      action: updateVendedoresAction,
      lastSync: null,
      isRunning: false,
      error: null,
    },
  ]);

  // propiedades
  const runningTasks = computed(() =>
    syncTasks.value.filter((task) => task.isRunning)
  );

  const completedTasks = computed(() =>
    syncTasks.value.filter((task) => !task.isRunning && task.lastSync)
  );

  const failedTasks = computed(() =>
    syncTasks.value.filter((task) => task.error)
  );

  // Cargar fechas de última sincronización desde localStorage
  const loadLastSyncDates = () => {
    syncTasks.value.forEach((task) => {
      const lastSync = localStorage.getItem(`lastSync_${task.id}`);
      if (lastSync) {
        task.lastSync = new Date(lastSync);
      }
    });
  };

  // Guardar fecha de última sincronización
  const saveLastSyncDate = (taskId: string, date: Date) => {
    localStorage.setItem(`lastSync_${taskId}`, date.toISOString());
  };

  // Ejecutar una tarea específica
  const executeTask = async (task: SyncTask): Promise<SyncResult> => {
    task.isRunning = true;
    task.error = null;

    try {
      await task.action();

      const result: SyncResult = {
        taskId: task.id,
        success: true,
        message: `${task.name} sincronizado exitosamente`,
        timestamp: new Date(),
      };

      task.lastSync = result.timestamp;
      saveLastSyncDate(task.id, result.timestamp);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      task.error = errorMessage;

      const result: SyncResult = {
        taskId: task.id,
        success: false,
        message: `Error al sincronizar ${task.name}: ${errorMessage}`,
        timestamp: new Date(),
      };

      return result;
    } finally {
      task.isRunning = false;
    }
  };

  // Ejecutar todas las tareas
  const executeAllTasks = async (): Promise<void> => {
    if (isSyncing.value) return;

    isSyncing.value = true;
    syncResults.value = [];

    try {
      const results = await Promise.allSettled(
        syncTasks.value.map((task) => executeTask(task))
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          syncResults.value.push(result.value);
        } else {
          const task = syncTasks.value[index];
          syncResults.value.push({
            taskId: task.id,
            success: false,
            message: `Error inesperado en ${task.name}`,
            timestamp: new Date(),
          });
        }
      });

      // Mostrar resultados
      showResults();
    } finally {
      isSyncing.value = false;
    }
  };

  // Ejecutar tarea específica
  const executeSingleTask = async (taskId: string): Promise<void> => {
    const task = syncTasks.value.find((t) => t.id === taskId);
    if (!task) return;

    const result = await executeTask(task);
    syncResults.value.push(result);

    // Mostrar notificación individual
    $q.notify({
      type: result.success ? "positive" : "negative",
      message: result.message,
      position: "top",
      timeout: 3000,
    });
  };

  // Mostrar resultados en modal
  const showResults = () => {
    const successCount = syncResults.value.filter((r) => r.success).length;
    const totalCount = syncResults.value.length;

    if (successCount === totalCount) {
      $q.notify({
        type: "info",
        message: `Todas las sincronizaciones completadas exitosamente (${totalCount}/${totalCount})`,
        position: "bottom-left",
        timeout: 4000, // 4 segundos visible
      });
    } else {
      showModal.value = true;
    }
  };

  // Formatear fecha
  const formatDate = (date: Date): string => {
    return date.toLocaleString("es-GT", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Inicializar
  loadLastSyncDates();

  return {
    // Estado
    isSyncing,
    syncResults,
    showModal,
    syncTasks,

    // Computed
    runningTasks,
    completedTasks,
    failedTasks,

    // Métodos
    executeAllTasks,
    executeSingleTask,
    showResults,
    formatDate,
    loadLastSyncDates,
  };
};
