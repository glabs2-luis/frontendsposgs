<template>
  <q-page padding class="column q-gutter-md">
    <ClaveModal v-model="claveModalVisible" @aceptar="onClaveIngresada" />
    <NotaCreditoView
      v-model="notaCreditoVisible"
      @nota-creada="onNotaCreada"
      @nota-editada="onNotaEditada" :vendedor="vendedorActual"
      :nota-para-editar="notaSeleccionadaParaEditar" />

    <template v-if="accesoPermitido">
      <div class="row items-center q-pb-md">
        <div class="text-h5 text-primary q-mr-md">Gestión de Notas de Crédito</div>
        <q-space />
        <q-btn color="primary" icon="add" label="Nueva Nota de Crédito" @click="nuevaNota" class="q-mr-sm" />
        <!-- <q-btn
          color="secondary"
          icon="print"
          label="Imprimir Todas"
          @click="printAllNotas"
          :disable="!filteredNotas.length"
        >
          <q-tooltip>Imprimir todas las notas de crédito visibles</q-tooltip>
        </q-btn> -->
      </div>

      <q-card flat bordered class="notes-card">
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-8">
              <q-input
                outlined
                dense
                v-model="searchTerm"
                placeholder="Buscar por Número, Cliente, Factura o Estado..."
                clearable
                @update:model-value="filterNotes"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4 q-gutter-x-sm text-right">
              <q-btn flat dense icon="refresh" @click="loadNotasDeCredito" round color="grey-7" size="md">
                <q-tooltip>Recargar Notas</q-tooltip>
              </q-btn>
              </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-table
          :rows="filteredNotas"
          :columns="columns"
          row-key="NUMERO_DEVOLUCION"
          flat
          dense
          :loading="loading"
          no-data-label="No se encontraron notas de crédito."
          class="notes-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:no-data="{ icon, message, filter }">
            <div class="full-width row flex-center text-accent q-gutter-sm q-py-lg">
              <q-icon size="2em" :name="icon" />
              <span>
                {{ message }}
              </span>
              <span v-if="filter">
                para: "{{ filter }}"
              </span>
            </div>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn icon="edit" size="sm" flat round color="primary" @click="editNota(props.row)">
                <q-tooltip>Editar Nota</q-tooltip>
              </q-btn>
              <q-btn icon="delete" size="sm" flat round color="negative" @click="confirmDelete(props.row)">
                <q-tooltip>Eliminar Nota</q-tooltip>
              </q-btn>
              <q-btn icon="print" size="sm" flat round color="secondary" @click="printNota(props.row)">
                <q-tooltip>Imprimir Nota</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { obtenerDevolucionesEnc } from '../action/useNotaCreditoActions';
import ClaveModal from '@/modules/notas_credito/components/ClaveModal.vue';
import NotaCreditoView from '@/modules/notas_credito/components/NotaCreditoView.vue';
import type { QTableColumn } from 'quasar';
import type { Vendedor, DevolucionEnc } from '@/modules/notas_credito/interfaces/NotaCredito';
import { useQuasar } from 'quasar';
import { eliminarDevolucion } from '../action/useNotaCreditoActions';

const $q = useQuasar();

const claveModalVisible = ref(true);
const accesoPermitido = ref(false);
const notaCreditoVisible = ref(false);
const vendedorActual = ref<Vendedor | null>(null);
const loading = ref(false);
const notaSeleccionadaParaEditar = ref<DevolucionEnc | null>(null);

const allNotas = ref<DevolucionEnc[]>([]);
const filteredNotas = ref<DevolucionEnc[]>([]);
const searchTerm = ref('');

const columns: QTableColumn<DevolucionEnc>[] = [
  { name: 'NUMERO_DEVOLUCION', label: 'No. Devolución', field: 'NUMERO_DEVOLUCION', align: 'left', sortable: true },
  { name: 'SERIE', label: 'Serie', field: 'SERIE', align: 'left', sortable: true },
  { name: 'NUMERO_FACTURA', label: 'No. Factura', field: 'NUMERO_FACTURA', align: 'left', sortable: true },
  {
    name: 'FECHA_DEVOLUCION',
    label: 'Fecha Devolución',
    field: 'FECHA_DE_INGRESO',
    align: 'left',
    sortable: true,
    format: (val: string | Date) => val ? new Date(val).toLocaleDateString('es-GT') : 'Sin Fecha'
  },
  { name: 'ESTADO_DE_DEVOLUCION', label: 'Estado', field: 'ESTADO_DE_DEVOLUCION', align: 'left', sortable: true },
  { name: 'CODIGO_DE_CLIENTE', label: 'Cód. Cliente', field: 'CODIGO_DE_CLIENTE', align: 'left', sortable: true },
  {
    name: 'TOTAL_DEVOLUCION',
    label: 'Total',
    field: 'TOTAL_DEVOLUCION',
    align: 'right',
    sortable: true,
    format: (val: number) => val ? `Q ${val.toFixed(2)}` : 'Q 0.00'
  },
  { name: 'actions', label: 'Acciones', align: 'center', field: row => row.NUMERO_DEVOLUCION },
];


async function loadNotasDeCredito() {
  loading.value = true;
  try {
    const data = await obtenerDevolucionesEnc();
    allNotas.value = data;
    filterNotes();
  } catch (error) {
    console.error('Error al obtener notas de crédito:', error);
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las notas de crédito. Por favor, inténtalo de nuevo.'
    });
  } finally {
    loading.value = false;
  }
}

function filterNotes() {
  const query = searchTerm.value.toLowerCase().trim();
  if (!query) {
    filteredNotas.value = [...allNotas.value];
    return;
  }
  filteredNotas.value = allNotas.value.filter(nota =>
    nota.NUMERO_DEVOLUCION?.toString().includes(query) ||
    nota.SERIE?.toLowerCase().includes(query) ||
    nota.NUMERO_FACTURA?.toString().includes(query) ||
    nota.ESTADO_DE_DEVOLUCION?.toLowerCase().includes(query) ||
    nota.OBSERVACIONES?.toLowerCase().includes(query) ||
    nota.CODIGO_DE_CLIENTE?.toString().includes(query) ||
    nota.USUARIO_QUE_INGRESO?.toLowerCase().includes(query)
  );
}

function onClaveIngresada({ clave, vendedor }: { clave: string; vendedor: Vendedor }) {
  accesoPermitido.value = true;
  vendedorActual.value = vendedor;
  loadNotasDeCredito();
}

function nuevaNota() {
  notaSeleccionadaParaEditar.value = null;
  notaCreditoVisible.value = true;
}

function onNotaCreada(nuevaNota: DevolucionEnc) {
  allNotas.value.unshift(nuevaNota);
  filterNotes();
  // $q.notify({
  //   type: 'positive',
  //   message: `Nota de Crédito ${nuevaNota.NUMERO_DEVOLUCION} creada exitosamente.`
  // });
}

function onNotaEditada(notaEditada: DevolucionEnc) {
  const index = allNotas.value.findIndex(n => n.NUMERO_DEVOLUCION === notaEditada.NUMERO_DEVOLUCION);
  if (index !== -1) {
    allNotas.value[index] = notaEditada;
  }
  filterNotes();
  // $q.notify({
  //   type: 'positive',
  //   message: `Nota de Crédito ${notaEditada.NUMERO_DEVOLUCION} actualizada exitosamente.`
  // });
}

function editNota(nota: DevolucionEnc) {
  notaSeleccionadaParaEditar.value = nota;
  notaCreditoVisible.value = true;
}

function confirmDelete(nota: DevolucionEnc) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar la Nota de Crédito ${nota.NUMERO_DEVOLUCION}? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    deleteNota(nota);
  });
}

async function deleteNota(nota: DevolucionEnc) {
  if (nota.NUMERO_DEVOLUCION === undefined || nota.NUMERO_DEVOLUCION === null) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener el número de devolución para eliminar la nota de crédito.',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  $q.loading.show({
    message: `Eliminando Nota de Crédito ${nota.NUMERO_DEVOLUCION}...`,
    boxClass: 'bg-grey-2 text-grey-9',
    spinnerColor: 'negative'
  });

  try {
    await eliminarDevolucion(nota.NUMERO_DEVOLUCION);

    allNotas.value = allNotas.value.filter(n => n.NUMERO_DEVOLUCION !== nota.NUMERO_DEVOLUCION);
    filterNotes();

    $q.notify({
      type: 'positive',
      message: `Nota de Crédito ${nota.NUMERO_DEVOLUCION} eliminada exitosamente.`,
      position: 'top',
      timeout: 3000
    });
  } catch (error: any) {
    console.error('Error al eliminar nota de crédito:', error);
    $q.notify({
      type: 'negative',
      message: `Error al eliminar la Nota de Crédito ${nota.NUMERO_DEVOLUCION}: ${error.message || 'Error desconocido'}.`,
      position: 'top',
      timeout: 5000
    });
  } finally {
    $q.loading.hide();
  }
}

function printNota(nota: DevolucionEnc) {
  console.log('Imprimir nota:', nota);
  $q.notify({
    type: 'info',
    message: `Generando impresión para la Nota ${nota.NUMERO_DEVOLUCION}.`
  });
  // window.open(`/print/nota/${nota.NUMERO_DEVOLUCION}`, '_blank');
}

function printAllNotas() {
  console.log('Imprimir todas las notas visibles:', filteredNotas.value);
  if (filteredNotas.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay notas para imprimir.'
    });
    return;
  }
  $q.notify({
    type: 'info',
    message: `Generando impresión de ${filteredNotas.value.length} notas de crédito.`
  });
  // window.open('/print/all-notas', '_blank');
}

watch(notaCreditoVisible, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    console.log('Modal NotaCreditoView cerrado, recargando notas de crédito...');
    loadNotasDeCredito();
  }
});

watch(searchTerm, filterNotes);

onMounted(() => {
  if (accesoPermitido.value) {
    loadNotasDeCredito();
  }
});
</script>

<style scoped>
.notes-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.notes-table :deep(.q-table__container) {
  border-radius: 12px;
}

.notes-table :deep(th) {
  font-weight: 600;
  background-color: #f0f4f8;
  color: #333;
  text-transform: uppercase;
}

.notes-table :deep(td.text-center) {
  padding: 8px 0;
}

.notes-table :deep(tbody tr:hover) {
  background-color: #f9f9f9;
}

.q-table__container {
  border-radius: 12px;
}
</style>
