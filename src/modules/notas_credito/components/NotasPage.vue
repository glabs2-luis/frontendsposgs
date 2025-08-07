<template>
  <q-page padding>
    <ClaveModal v-model="claveModalVisible" @aceptar="onClaveIngresada" />
    <NotaCreditoView
      v-model="notaCreditoVisible"
      @nota-creada="onNotaCreada"
      @nota-editada="onNotaEditada"
      :vendedor="vendedorActual"
      :nota-para-editar="notaSeleccionadaParaEditar"
    />

    <template v-if="accesoPermitido">
      <div class="q-pa-md q-mx-auto" style="max-width: 1200px">
        <div class="row items-center q-mb-md">
          <div class="text-h4 text-primary q-mr-md">Gestión de Notas de Crédito</div>
          <q-space />
          <q-btn color="primary" icon="add" label="Nueva Nota" @click="nuevaNota" />
        </div>

        <q-card flat bordered class="q-pa-sm">
          <q-card-section>
            <div class="row q-col-gutter-sm items-center">
              <div class="col-xs-12 col-sm-6 col-md-4">
                <q-input
                  outlined
                  dense
                  v-model="searchTerm"
                  placeholder="Buscar..."
                  clearable
                  @update:model-value="filterNotes"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <q-space />

              <div class="col-auto">
                <q-btn
                  flat
                  dense
                  icon="refresh"
                  @click="loadNotasDeCredito"
                  round
                  color="grey-7"
                >
                  <q-tooltip>Recargar Notas</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
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
              
              <template v-slot:no-data="{ icon, message }">
                <div class="full-width row flex-center text-accent q-gutter-sm q-py-lg">
                  <q-icon size="2em" :name="icon" />
                  <span>{{ message }}</span>
                </div>
              </template>

              <template v-slot:body-cell-ESTADO_DE_DEVOLUCION="props">
                <q-td :props="props">
                  <q-badge
                    v-if="estadosDevolucion[props.value]"
                    :color="estadosDevolucion[props.value].color"
                    :label="estadosDevolucion[props.value].label"
                  />
                  <q-badge
                    v-else
                    color="grey"
                    label="Desconocido"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat round icon="more_vert">
                    <q-menu auto-close>
                      <q-list dense style="min-width: 150px">
                        <q-item
                          clickable
                          v-ripple
                          @click="editNota(props.row)"
                          :disable="['t', 'v'].includes(props.row.ESTADO_DE_DEVOLUCION.toLowerCase())"
                        >
                          <q-item-section avatar>
                            <q-icon color="primary" name="edit" />
                          </q-item-section>
                          <q-item-section>Editar</q-item-section>
                          <q-tooltip v-if="['t', 'v'].includes(props.row.ESTADO_DE_DEVOLUCION.toLowerCase())">
                            No se puede editar una nota finalizada o verificada
                          </q-tooltip>
                        </q-item>

                        <q-item
                          clickable
                          v-ripple
                          @click="confirmDelete(props.row)"
                          :disable="['t'].includes(props.row.ESTADO_DE_DEVOLUCION.toLowerCase())"
                        >
                          <q-item-section avatar>
                            <q-icon color="negative" name="delete" />
                          </q-item-section>
                          <q-item-section>Eliminar</q-item-section>
                          <q-tooltip v-if="['t', 'v'].includes(props.row.ESTADO_DE_DEVOLUCION.toLowerCase())">
                            No se puede eliminar una nota finalizada o verificada
                          </q-tooltip>
                        </q-item>

                        <q-separator />

                        <q-item
                          clickable
                          v-ripple
                          @click="printNota(props.row)"
                          :disable="props.row.ESTADO_DE_DEVOLUCION.toLowerCase() !== 't'"
                        >
                          <q-item-section avatar>
                            <q-icon color="secondary" name="print" />
                          </q-item-section>
                          <q-item-section>Imprimir</q-item-section>
                          <q-tooltip v-if="props.row.ESTADO_DE_DEVOLUCION.toLowerCase() !== 't'">
                            Solo se puede imprimir una nota finalizada
                          </q-tooltip>
                        </q-item>

                        <q-item
                          clickable
                          v-ripple
                          v-if="['p', 'v'].includes(props.row.ESTADO_DE_DEVOLUCION.toLowerCase())"
                          @click="certificarNota(props.row)"
                        >
                          <q-item-section avatar>
                            <q-icon color="green" name="verified_user" />
                          </q-item-section>
                          <q-item-section>Certificar</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { obtenerDevoluciones, obtenerDevolucionesEncDetalle, obtenerVendedor } from '../action/useNotaCreditoActions';
import ClaveModal from '@/modules/notas_credito/components/ClaveModal.vue';
import NotaCreditoView from '@/modules/notas_credito/components/NotaCreditoView.vue';
import type { QTableColumn } from 'quasar';
import type { Vendedor, DevolucionEnc, ApiFacturaResponse } from '@/modules/notas_credito/interfaces/NotaCredito';
import type { DataFactura } from '@/modules/facturar_pdf/interfaces/pdfInterface'
import { useQuasar } from 'quasar';
import { eliminarDevolucion } from '../action/useNotaCreditoActions';
import { usePdfFactura } from '@/modules/facturar_pdf/composables/usePdFactura';
import { useCertification } from '@/modules/certification/composables/useCertification'
import { Certification, DtoCertificado } from '@/modules/certification/interfaces/certificationInterface';
import { showErrorNotification } from '@/common/helper/notification';
// import { certificarDevolucion } from '../action/useNotaCreditoActions';
import { crearCertificacionNcAction } from '@/modules/certification/actions/certificationAction'
import { obtenerDtoCertificado } from '@/modules/certification/actions/certificationAction'

const $q = useQuasar();
const { generarFacturaPDF } = usePdfFactura();

const claveModalVisible = ref(true);
const accesoPermitido = ref(false);
const notaCreditoVisible = ref(false);
const vendedorActual = ref<Vendedor | null>(null);
const loading = ref(false);
const notaSeleccionadaParaEditar = ref<DevolucionEnc | null>(null);

const allNotas = ref<DevolucionEnc[]>([]);
const filteredNotas = ref<DevolucionEnc[]>([]);
const searchTerm = ref('');
const { mutateCertificarNc } = useCertification()

const estadosDevolucion = {
  T: { label: 'Terminado', color: 'positive' },
  P: { label: 'Pendiente', color: 'warning' },
  V: { label: 'Verificado', color: 'info' }
};

const columns: QTableColumn<DevolucionEnc>[] = [
  { name: 'NUMERO_DEVOLUCION', label: 'NUMERO', field: 'NUMERO_DEVOLUCION', align: 'left', sortable: true },
  { name: 'SERIE', label: 'Serie', field: 'SERIE', align: 'left', sortable: true },
  { name: 'NUMERO_FACTURA', label: 'FACTURA', field: 'NUMERO_FACTURA', align: 'left', sortable: true },
  { name: 'FECHA_DEVOLUCION', label: 'Fecha Devolución', field: 'FECHA_DE_INGRESO', align: 'left', sortable: true, format: (val: string | Date) => val ? new Date(val).toLocaleDateString('es-GT') : 'Sin Fecha' },
  { name: 'ESTADO_DE_DEVOLUCION', label: 'Estado', field: 'ESTADO_DE_DEVOLUCION', align: 'left', sortable: true },
  { name: 'NOMBRE', label: 'NOMBRE CLIENTE', field: 'NOMBRE', align: 'left', sortable: true },
  { name: 'TOTAL_DEVOLUCION', label: 'Total', field: 'TOTAL_DEVOLUCION', align: 'right', sortable: true, format: (val: number) => val ? `Q ${val.toFixed(2)}` : 'Q 0.00' },
  { name: 'actions', label: 'Acciones', align: 'center', field: row => row.NUMERO_DEVOLUCION },
];

async function loadNotasDeCredito() {
  loading.value = true;
  try {
    const data = await obtenerDevoluciones();
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
  const query = (searchTerm.value ?? '').toLowerCase().trim();
  
  if (!query) {
    filteredNotas.value = [...allNotas.value];
    return;
  }
  
  filteredNotas.value = allNotas.value.filter(nota => {
    const estadoLabel = estadosDevolucion[nota.ESTADO_DE_DEVOLUCION]?.label.toLowerCase();

    return (
      nota.NUMERO_DEVOLUCION?.toString().includes(query) ||
      nota.SERIE?.toLowerCase().includes(query) ||
      nota.NUMERO_FACTURA?.toString().includes(query) ||
      (estadoLabel && estadoLabel.includes(query)) ||
      nota.OBSERVACIONES?.toLowerCase().includes(query) ||
      nota.CODIGO_DE_CLIENTE?.toString().includes(query) ||
      nota.USUARIO_QUE_INGRESO?.toLowerCase().includes(query) ||
      nota.NOMBRE?.toLocaleLowerCase().includes(query)
    )
  });
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
  filterNotes();
}

function onNotaEditada(notaEditada: DevolucionEnc) {
  filterNotes();
}

function editNota(nota: DevolucionEnc) {
  if (nota.ESTADO_DE_DEVOLUCION.toLowerCase() !== 't' && nota.ESTADO_DE_DEVOLUCION.toLowerCase() !== 'v') {
    notaSeleccionadaParaEditar.value = nota;
    notaCreditoVisible.value = true;
  } else {
    $q.notify({
      type: 'negative',
      message: 'No se puede editar una nota de crédito con estado finalizada o verificada.',
      position: 'top',
      timeout: 3000
    });
    return;
  }
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

// Función para certificar la nota de crédito
async function certificarNota(nota: DevolucionEnc) {
  $q.dialog({
    title: 'Confirmar Certificación',
    message: `¿Estás seguro de que deseas certificar la Nota de Crédito ${nota.NUMERO_DEVOLUCION}? Esto la dejará como finalizada.`,
    cancel: true,
    persistent: true,
    color: 'green'
  }).onOk(async () => {
    try {
      console.log("Entra a certificas...")
      $q.loading.show({
        message: `Certificando Nota de Crédito ${nota.NUMERO_DEVOLUCION}...`,
        boxClass: 'bg-grey-2 text-grey-9',
        spinnerColor: 'positive'
      });

      const response = await certificarDevolucion(nota.NUMERO_DEVOLUCION)

      console.log("Certificado:", response);

      if (response) {
        const notaDeCredito = await obtenerDtoCertificado('NCRE', nota.NUMERO_DEVOLUCION)
        const datosNotasDeCredito = await prepararDataNotaDeCredito(nota, notaDeCredito);
        const success = await generarFacturaPDF(datosNotasDeCredito);

        if (success) {
          console.log("Nota de credito generado con exito.")
        } else {
          console.log("Fallo al genera nota de credito.")
        }

        loadNotasDeCredito();

        $q.notify({
          type: 'positive',
          message: `Nota de Crédito ${nota.NUMERO_DEVOLUCION} certificada exitosamente.`,
          position: 'top',
          timeout: 3000
        });
      }

    } catch (error) {
      console.error('Error al certificar la nota de crédito:', error);
      $q.notify({
        type: 'negative',
        message: `Error al certificar la nota. Por favor, inténtalo de nuevo. ${error}`,
        position: 'top',
        timeout: 5000
      });
    } finally {
      $q.loading.hide();
    }
  });
}

const prepararDataNotaDeCredito = async (nota: DevolucionEnc, dtoCertificado: DtoCertificado): Promise<DataFactura> => {
  const formatCurrency = (value: number) => `Q.${value.toFixed(4)}`;

  const apiResponse = await obtenerDevolucionesEncDetalle(nota.NUMERO_DEVOLUCION);
  const vendedor = await obtenerVendedor(parseInt(apiResponse.DEVOLUCION_ENC.USUARIO_QUE_INGRESO))

  const enc = apiResponse.DEVOLUCION_ENC;

  const items = enc.DEVOLUCION_DET.map((item: any) => {
    return {
      cantidad: item.CANTIDAD_DEVUELTA,
      descripcion: item.NOMBRE_PRODUCTO,
      precio: formatCurrency(item.PRECIO_DEVOLUCION),
      subtotal: formatCurrency(item.SUB_TOTAL + item.MONTO_IVA),
    };
  });

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = items.reduce((acc, item) => acc + parseFloat(item.subtotal.replace("Q.", "")), 0);
  const totalPagar = subtotal + (enc.MONTO_IVA || 0);

  const dataFactura: DataFactura = {
    encabezado: {
      serie: dtoCertificado.SERIE_FACTURA_FEL,
      numero: String(dtoCertificado.NUMERO_FACTURA_FEL),
      uuid: dtoCertificado.UUID,
      numeroInterno: `${"NCRE"} | ${enc.NUMERO_DEVOLUCION}`,
      tipoDocumento: "NOTA DE CREDITO",
      fechaEmision: new Date().toISOString(),
    },

    cliente: {
      nombre: "CLIENTE DE PRUEBA",
      nit: String(enc.CODIGO_DE_CLIENTE ?? "CF"),
      direccion: "CIUDAD",
    },

    items,

    resumen: {
      subtotal: formatCurrency(subtotal),
      descuento: "Q.0.00",
      totalPagar: formatCurrency(enc.TOTAL_DEVOLUCION),
      totalItems,
    },
    nombreVendedor: vendedor.NOMBRE_VENDEDOR,
    qrCodeData: `${dtoCertificado.UUID}`,
  };

  return dataFactura;
};

async function printNota(nota: DevolucionEnc) {
  if (nota.ESTADO_DE_DEVOLUCION.toLowerCase() !== 't') {
    $q.notify({
      type: 'negative',
      message: 'No se puede imprimir una nota de credito sin finaliza.',
      position: 'top',
      timeout: 3000
    });
    return;
  }

  try {
    $q.loading.show({
      message: 'Imprimiendo nota de credito',
      boxClass: 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary'
    });

    const notaDeCredito = await obtenerDtoCertificado('NCRE', nota.NUMERO_DEVOLUCION)

    const datosNotasDeCredito = await prepararDataNotaDeCredito(nota, notaDeCredito);

    const success = await generarFacturaPDF(datosNotasDeCredito);

    if (success) {
      console.log("Nota de credito generado con exito.")
    } else {
      console.log("Fallo al genera nota de credito.")
    }

    $q.loading.hide();
  } catch (error) {
    console.log('Error al imprimir nota: ', error);
    $q.notify({
      type: 'negative',
      message: `Error al imprimir la nota de credito con numero: ${nota.NUMERO_DEVOLUCION}.`
    });
  }
}

const certificarDevolucion = async (numeroDevolucion: number) => {
  try {
    const devolucion = await obtenerDevolucionesEncDetalle(numeroDevolucion)

    if (!devolucion || devolucion.DEVOLUCION_ENC.DEVOLUCION_DET.length === 0) return

    console.log('Datos de la devolucion:', devolucion.DEVOLUCION_ENC.NUMERO_DEVOLUCION)

    const result = crearCertificacionNcAction({ sucursal: '1', numeroDevolucion: devolucion.DEVOLUCION_ENC.NUMERO_DEVOLUCION })

    return result
  } catch (error) {
    console.error('Error al certificar la nota de credito: ', error)
  }
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
