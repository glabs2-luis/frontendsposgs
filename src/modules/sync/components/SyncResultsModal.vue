<template>
  <q-dialog v-model="showModal" persistent>
    <q-card class="sync-results-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="row items-center">
          <q-icon name="sync" size="24px" class="q-mr-sm" />
          <span class="text-h6">Resultados de Sincronización</span>
        </div>
      </q-card-section>

      <!-- Content -->
      <q-card-section class="modal-content">
        <!-- Estado actual de tareas -->
        <div class="tasks-status q-mb-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            Estado actual de las tareas
          </div>
          <q-list class="tasks-list">
            <q-item
              v-for="task in tasks"
              :key="task.id"
              class="task-item"
              :class="{ 'task-running': task.isRunning }"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="getTaskStatusColor(task)"
                  :icon="getTaskIcon(task)"
                  text-color="white"
                  size="40px"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium task-name">
                  {{ task.name }}
                </q-item-label>
                <q-item-label caption class="task-description">
                  {{ task.description }}
                </q-item-label>

                <!-- Última sincronización -->
                <div v-if="task.lastSync" class="q-mt-xs">
                  <q-item-label caption class="text-grey-6">
                    Última sincronización:
                  </q-item-label>
                  <q-item-label class="text-weight-medium text-primary">
                    {{ formatDate(task.lastSync) }}
                  </q-item-label>
                </div>

                <!-- Mensaje de error -->
                <div v-if="task.error" class="error-message q-mt-xs">
                  <q-item-label caption class="text-negative">
                    Error: {{ task.error }}
                  </q-item-label>
                </div>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center q-gutter-sm">
                  <q-chip
                    :color="getTaskStatusColor(task)"
                    text-color="white"
                    :label="getTaskStatusText(task)"
                    size="sm"
                    class="status-chip"
                  />
                  <q-btn
                    :loading="task.isRunning"
                    :disable="isSyncing"
                    :color="getTaskStatusColor(task)"
                    :label="task.isRunning ? 'Sincronizando...' : 'Sincronizar'"
                    size="sm"
                    unelevated
                    @click="executeSingleTask(task.id)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Lista de resultados recientes -->
        <div v-if="results.length > 0" class="recent-results q-mt-lg">
          <div class="text-subtitle1 text-weight-medium q-mb-md">
            Resultados Recientes
          </div>
          <q-list class="results-list">
            <q-item
              v-for="result in results"
              :key="result.taskId"
              class="result-item"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="result.success ? 'positive' : 'negative'"
                  :icon="result.success ? 'check_circle' : 'error'"
                  text-color="white"
                  size="32px"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-medium">
                  {{ getTaskName(result.taskId) }}
                </q-item-label>
                <q-item-label caption class="text-grey-6">
                  {{ formatDate(result.timestamp) }}
                </q-item-label>
                <div v-if="!result.success" class="error-message q-mt-xs">
                  <q-item-label caption class="text-negative">
                    {{ result.message }}
                  </q-item-label>
                </div>
              </q-item-section>

              <q-item-section side>
                <q-chip
                  :color="result.success ? 'positive' : 'negative'"
                  text-color="white"
                  :label="result.success ? 'Exitoso' : 'Error'"
                  size="sm"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="modal-actions">
        <q-btn flat label="Cerrar" color="grey-7" @click="closeModal" />
        <q-btn
          unelevated
          label="Sincronizar Todo"
          color="primary"
          :loading="isSyncing"
          :disable="isSyncing"
          @click="executeAll"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SyncResult, SyncTask } from "../composables/useSyncManager";

interface Props {
  show: boolean;
  results: SyncResult[];
  tasks: SyncTask[];
  isSyncing: boolean;
}

interface Emits {
  (e: "update:show", value: boolean): void;
  (e: "execute-all"): void;
  (e: "execute-single", taskId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// propiedad computed para v-model
const showModal = computed({
  get: () => props.show,
  set: (value: boolean) => emit("update:show", value),
});

// propiedades computed
const summaryText = computed(() => {
  const successCount = props.results.filter((r) => r.success).length;
  const totalCount = props.results.length;

  if (totalCount === 0) return "Sin resultados";
  return `${successCount}/${totalCount} exitosos`;
});

const summaryColor = computed(() => {
  const successCount = props.results.filter((r) => r.success).length;
  const totalCount = props.results.length;

  if (totalCount === 0) return "grey";
  if (successCount === totalCount) return "positive";
  if (successCount === 0) return "negative";
  return "warning";
});

const summaryTextColor = computed(() => {
  return summaryColor.value === "grey" ? "grey-7" : "white";
});

// metodos
const getTaskName = (taskId: string): string => {
  const task = props.tasks.find((t) => t.id === taskId);
  return task?.name || taskId;
};

const getTaskStatusColor = (task: SyncTask): string => {
  if (task.isRunning) return "primary";
  if (task.error) return "negative";
  if (task.lastSync) return "positive";
  return "grey";
};

const getTaskStatusText = (task: SyncTask): string => {
  if (task.isRunning) return "Ejecutando";
  if (task.error) return "Error";
  if (task.lastSync) return "Completado";
  return "Pendiente";
};

const getTaskIcon = (task: SyncTask): string => {
  if (task.isRunning) return "sync";
  if (task.error) return "error";
  if (task.lastSync) return "check_circle";
  return "schedule";
};

const formatDate = (date: Date): string => {
  return date.toLocaleString("es-GT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const closeModal = () => {
  emit("update:show", false);
};

const executeAll = () => {
  emit("execute-all");
};

const executeSingleTask = (taskId: string) => {
  emit("execute-single", taskId);
};
</script>

<style scoped>
.sync-results-modal {
  min-width: 600px;
  max-width: 800px;
}

.modal-header {
  background: linear-gradient(90deg, #ffeb3b, #fbc02d);
  color: #333;
  border-bottom: 1px solid #fdd835;
}

.modal-content {
  max-height: 600px;
  overflow-y: auto;
}

/* Estilos para las listas de tareas */
.tasks-list {
  background: #fafafa;
  border-radius: 12px;
  padding: 8px;
  border: 1px solid #e0e0e0;
}

.task-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #ffeb3b;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-running {
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
  border-color: #2196f3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.task-name {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 4px;
}

.task-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.status-chip {
  font-weight: 500;
  border-radius: 16px;
}

/* Estilos para la lista de resultados */
.results-list {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 8px;
  border: 1px solid #e0e0e0;
}

.result-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 6px;
  padding: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.result-item:last-child {
  margin-bottom: 0;
}

.error-message {
  color: #d32f2f;
  font-size: 0.875rem;
  padding-left: 8px;
  border-left: 3px solid #d32f2f;
  margin-top: 4px;
}

.tasks-status {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.modal-actions {
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  background: #fafafa;
}

.recent-results {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

/* Animaciones */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.task-running .q-avatar {
  animation: pulse 2s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .sync-results-modal {
    min-width: 95vw;
    max-width: 95vw;
  }

  .task-item {
    padding: 12px;
  }

  .task-name {
    font-size: 1rem;
  }
}
</style>
