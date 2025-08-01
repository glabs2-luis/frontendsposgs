<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="max-width: 1200px; width: 100%;">
      <q-card-section class="bg-primary text-white row items-center q-py-sm">
        <div class="text-h6 text-weight-bold">
          Nueva Nota de Crédito
          <span v-if="numeroDevolucionNC" class="text-subtitle1 text-grey-3 q-ml-sm">
            (No. NC: {{ numeroDevolucionNC }})
          </span>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" color="white" />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-stepper v-model="step" flat animated navigation color="primary">
          <q-step name="1" title="Buscar Factura" icon="search" :done="step > '1'">
            <div class="q-gutter-md q-mb-md">
              <q-form @submit="buscarFactura">
                <q-input v-model="serie" label="Serie de Factura" outlined placeholder="Ej: A001" :rules="[val => !!val || 'La serie es obligatoria']" />
                <q-input v-model="numeroFactura" type="number" label="Número de Factura" outlined clearable icon="receipt" :rules="[val => !!val || 'El numero de factura es obligatorio']" />
                <q-btn label="Buscar Factura" color="primary" unelevated icon="search" type="submit" class="q-mt-md" :disable="!serie || !numeroFactura" />
              </q-form>
            </div>
          </q-step>

          <q-step name="2" title="Seleccionar Productos" icon="inventory_2" :done="step > '2'">
            <div class="row q-col-gutter-lg">
              <div class="col-xs-12 col-md-9">
                <q-card bordered class="q-mb-md shadow-2">
                  <q-card-section class="bg-grey-2 text-primary text-subtitle1 text-weight-bold q-py-sm">
                    <div class="row items-center no-wrap">
                      <q-icon name="info" class="q-mr-sm" size="sm" />
                      <div>Factura Original: <span class="text-weight-regular">{{ serie }} - {{ numeroFactura }}</span></div>
                      <q-space />
                      <div>Cliente: <span class="text-weight-regular">{{ factura?.FACTURA.NOMBRE_CLI_A_FACTUAR }}</span></div>
                    </div>
                  </q-card-section>
                </q-card>

                <div class="text-h6 text-primary q-mt-md q-mb-sm">
                  <q-icon name="add_shopping_cart" class="q-mr-sm" />
                  Agregar Productos a la Nota de Crédito
                </div>
                <div class="row q-col-gutter-md q-mb-md items-end">
                  <div class="col-xs-12 col-sm-6 col-md-5">
                    <q-input
                      v-model="codigoInputManual"
                      label="Código de barras / manual"
                      outlined
                      clearable
                      icon="barcode_scanner"
                      @keyup.enter="agregarProducto"
                    />
                  </div>
                  <div class="col-xs-12 col-sm-3 col-md-3">
                    <q-input
                      v-model.number="cantidadInput"
                      type="number"
                      label="Cantidad"
                      outlined
                      min="1"
                      :max="getMaxCantidad()"
                      :disable="!codigoInputManual"
                      @keyup.enter="agregarProducto"
                    />
                  </div>
                  <div class="col-xs-12 col-sm-3 col-md-4">
                    <q-btn
                      label="Añadir Producto"
                      color="primary"
                      push
                      icon="add_circle"
                      @click="agregarProducto"
                      class="full-width container-btn-add"
                      :disable="!codigoInputManual || cantidadInput <= 0"
                    />
                  </div>
                </div>

                <div v-if="productosSeleccionados.length > 0" class="relative-position">
                  <q-table
                    :rows="productosSeleccionados"
                    :columns="columns"
                    row-key="id"
                    dense
                    flat
                    bordered
                    class="q-mb-md shadow-8 rounded-borders"
                    v-model:pagination="pagination"
                    :rows-per-page-options="[5, 10, 15, 20, 25, 50, 0]"
                  >
                    <template v-slot:body-cell-cantidadNC="props">
                      <q-td :props="props">
                        <q-chip v-if="!props.row.editando" size="md">
                          {{ props.row.cantidadNC }}
                        </q-chip>
                        <q-input
                          v-else
                          v-model.number="props.row.cantidadNC"
                          type="number"
                          dense
                          outlined
                          min="1"
                          :max="props.row.cantidad"
                          @blur="validarYGuardarCantidad(props.row)"
                          @keyup.enter="validarYGuardarCantidad(props.row)"
                          autofocus
                          color="warning"
                          :rules="[val => val > 0 || 'Inválida', val => val <= props.row.cantidad || `Max: ${props.row.cantidad}`]"
                        />
                      </q-td>
                    </template>

                    <template v-slot:body-cell-acciones="props">
                      <q-td :props="props">
                        <q-btn
                          :icon="props.row.editando ? 'save' : 'edit'"
                          :color="props.row.editando ? 'positive' : 'warning'"
                          flat
                          round
                          dense
                          @click="() => { props.row.editando = !props.row.editando; if (props.row.editando) props.row.tempOriginalCantidadNC = props.row.cantidadNC; }"
                          :title="props.row.editando ? 'Guardar' : 'Editar cantidad'"
                        />
                        <q-btn
                          icon="delete"
                          color="negative"
                          flat
                          round
                          dense
                          @click="eliminarProducto(props.row.id)"
                          title="Eliminar producto"
                        />
                      </q-td>
                    </template>
                  </q-table>
                </div>

                <div v-else class="q-pa-lg text-center text-grey-6 bg-grey-2 rounded-borders">
                  <q-icon name="info" size="lg" class="q-mb-sm" />
                  <p class="text-subtitle1 text-weight-medium">Aún no has agregado productos a la nota de crédito.</p>
                </div>
              </div>

              <div class="col-xs-12 col-md-3">
                <q-card class="bg-blue-grey-1 q-pa-md shadow-2">
                  <q-banner v-if="numeroDevolucionNC" rounded class="bg-secondary text-white q-mb-md text-weight-medium shadow-2">
                    <template v-slot:avatar>
                      <q-icon name="confirmation_number" color="white" />
                    </template>
                    Devolucion No. {{ numeroDevolucionNC }}
                  </q-banner>

                  <q-list dense>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Total Factura Original</q-item-label>
                        <q-item-label class="text-weight-bold text-positive text-h6">
                          Q {{ factura?.FACTURA.TOTAL_GENERAL?.toFixed(2) || '0.00' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item class="q-mt-md">
                      <q-item-section>
                        <q-item-label caption>Total Nota de Crédito</q-item-label>
                        <q-item-label class="text-weight-bold text-negative text-h4">
                          Q {{ totalNC.toFixed(2) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </div>
            </div>

            <q-stepper-navigation>
              <div class="row justify-between q-mt-md">
                <q-btn flat label="Anterior" @click="step = '1'" color="primary" />
                <q-btn label="Siguiente" color="primary" push icon-right="arrow_forward" :disable="productosSeleccionados.length === 0 || totalNC === 0" @click="step = '3'" />
              </div>
            </q-stepper-navigation>
          </q-step>



          <q-step name="3" title="Confirmar y Emitir" icon="check_circle" :done="step > '3'">
            <q-banner v-if="numeroDevolucionNC" rounded class="bg-blue-1 text-blue-9 q-mb-md text-weight-medium shadow-2">
              <template v-slot:avatar>
                <q-icon name="assignment_turned_in" color="blue-9" />
              </template>
              Revisión final: **Nota de Crédito No. {{ numeroDevolucionNC }}**. Por favor, verifica los detalles antes de emitir.
            </q-banner>

            <div class="row q-col-gutter-md">
              <div class="col-md-6 col-xs-12">
                <q-card bordered class="q-mb-md shadow-4">
                  <q-card-section class="bg-grey-2 text-primary text-subtitle1 text-weight-bold q-py-sm">
                    <div class="row items-center no-wrap">
                      <q-icon name="receipt" class="q-mr-sm" size="sm" />
                      <div>Factura Original</div>
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-section class="q-pa-md">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>Cliente</q-item-label>
                        <q-item-label class="text-weight-bold">{{ factura?.FACTURA.NOMBRE_CLI_A_FACTUAR }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator inset />
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>Número de Factura</q-item-label>
                        <q-item-label class="text-weight-bold">{{ serie }} - {{ numeroFactura }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-card-section>
                </q-card>

                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-sm-6 col-xs-12">
                    <q-card flat bordered class="bg-positive-1 text-positive shadow-2">
                      <q-card-section class="q-pa-md">
                        <div class="text-overline">Total Factura Original</div>
                        <div class="text-h6 text-weight-bold">Q {{ factura?.FACTURA.TOTAL_GENERAL?.toFixed(2) }}</div>
                      </q-card-section>
                    </q-card>
                  </div>
                  <div class="col-sm-6 col-xs-12">
                    <q-card flat bordered class="bg-negative-1 text-negative shadow-2">
                      <q-card-section class="q-pa-md">
                        <div class="text-overline">Total Nota de Crédito</div>
                        <div class="text-h6 text-weight-bold">Q {{ totalNC.toFixed(2) }}</div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>


                <q-input
                  v-model="observaciones"
                  label="Observaciones de la Nota de Crédito"
                  outlined
                  type="textarea"
                  rows="3"
                  placeholder="Ingrese cualquier observación relevante."
                />


              </div>

              <div class="col-md-6 col-xs-12">
                <q-card bordered class="q-mb-md shadow-4">
                  <q-card-section class="bg-grey-2 text-primary text-subtitle1 text-weight-bold q-py-sm">
                    <div class="row items-center no-wrap">
                      <q-icon name="shopping_cart" class="q-mr-sm" size="sm" />
                      <div>Productos a Devolver</div>
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-section class="q-pa-md">
                    <q-list v-if="productosSeleccionados.length > 0" dense>
                      <q-item v-for="prod in productosSeleccionados" :key="prod.id">
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{ prod.producto }}</q-item-label>
                          <q-item-label caption>Código: {{ prod.codigo }}</q-item-label>
                        </q-item-section>
                        <q-item-section side class="text-right">
                          <q-item-label>{{ prod.cantidadNC }} x Q {{ prod.precio.toFixed(2) }}</q-item-label>
                          <q-item-label class="text-weight-bold text-negative">Q {{ (prod.cantidadNC * prod.precio).toFixed(2) }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <div v-else class="text-center text-grey-6 q-py-md">
                      <q-icon name="info" size="lg" class="q-mb-sm" />
                      <p class="text-subtitle1">No hay productos seleccionados.</p>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
            <q-stepper-navigation>
              <div class="row justify-between q-mt-md">
                <q-btn flat label="Anterior" @click="step = '2' " color="primary" />
                <q-btn label="Emitir Nota de Crédito" color="positive" push icon-right="check_circle" :disable="productosSeleccionados.length === 0 || totalNC === 0" @click="emitirNota" />
              </div>
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>


<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar, QTableColumn } from 'quasar';
import {
  buscarFactura as buscarFacturaAPI,
  crearDevolucionEnc,
  crearDevolucionDet,
  obtenerDevolucionesDet,
  obtenerDevolucionesEncPorNumero,
  actualizarDevolucionDet,
  actualizarDevolucionEnc,
  eliminarDevolucionDet
} from '@/modules/notas_credito/action/useNotaCreditoActions';
import type { ApiFacturaResponse, DevolucionEnc, DevolucionDet, Vendedor, ProductoNotaCredito } from '@/modules/notas_credito/interfaces/NotaCredito';

interface Props {
  modelValue: boolean;
  vendedor: Vendedor | null;
  notaParaEditar?: DevolucionEnc | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'nota-creada', nota: DevolucionEnc): void;
  (e: 'update:modelValue', value: boolean): void;
  (e: 'nota-editada', nota: DevolucionEnc): void;
}>();

const $q = useQuasar();

const useAppStatus = () => {
  const isLoading = ref(false);
  const showLoading = (message: string) => {
    isLoading.value = true;
    $q.loading.show({
      message,
      boxClass: 'bg-grey-2 text-grey-9',
      spinnerColor: 'primary'
    });
  };
  const hideLoading = () => {
    isLoading.value = false;
    $q.loading.hide();
  };
  const notify = (type: 'positive' | 'negative' | 'warning' | 'info', message: string, timeout = 3000) => {
    $q.notify({ type, message, position: 'top', timeout });
  };
  return { isLoading, showLoading, hideLoading, notify };
};

const { isLoading, showLoading, hideLoading, notify } = useAppStatus();

const step = ref<'1' | '2' | '3'>('1');
const serie = ref('');
const numeroFactura = ref<number | null>(null);
const factura = ref<ApiFacturaResponse | null>(null);
const productosFactura = ref<ProductoNotaCredito[]>([]); // Productos de la factura original
const productosSeleccionados = ref<ProductoNotaCredito[]>([]); // Productos para la NC
const codigoInputManual = ref('');
const cantidadInput = ref<number>(1);
const observaciones = ref('');
const numeroDevolucionNC = ref<number | null>(null);
const isEditing = ref(false);

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10
});

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const totalNC = computed(() =>
  productosSeleccionados.value.reduce(
    (sum, p) => sum + (p.cantidadNC || 0) * p.precio,
    0
  )
);

const columns: QTableColumn<ProductoNotaCredito>[] = [
  { name: 'nombre', label: 'Producto', field: 'producto', align: 'left', classes: 'text-weight-bold', headerClasses: 'bg-primary text-white' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', headerClasses: 'bg-primary text-white' },
  { name: 'cantidad', label: 'Cant. Facturada', field: 'cantidad', align: 'center', headerClasses: 'bg-primary text-white' },
  { name: 'cantidadNC', label: 'Cant. NC', field: 'cantidadNC', align: 'center', headerClasses: 'bg-primary text-white' },
  { name: 'precio', label: 'Precio Unit.', field: 'precio', align: 'right', format: (val) => `Q ${val.toFixed(2)}`, headerClasses: 'bg-primary text-white' },
  { name: 'subtotal', label: 'Subtotal NC', field: (row) => row.cantidadNC * row.precio, align: 'right', format: (val: number) => `Q ${val.toFixed(2)}`, headerClasses: 'bg-primary text-white' },
  { name: 'acciones', label: 'Acciones', field: row => row.id, align: 'center', headerClasses: 'bg-primary text-white' }
];

function formatDate(date: Date | string | undefined | null): string {
  if (!date) return 'N/A';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) {
      return 'Fecha inválida';
    }
    return d.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Fecha inválida';
  }
}

function resetForm() {
  step.value = '1';
  serie.value = '';
  numeroFactura.value = null;
  factura.value = null;
  productosFactura.value = [];
  productosSeleccionados.value = [];
  codigoInputManual.value = '';
  cantidadInput.value = 1;
  observaciones.value = '';
  numeroDevolucionNC.value = null;
  isEditing.value = false;
}

async function loadNotaForEdit(nota: DevolucionEnc) {
  if (!nota.NUMERO_DEVOLUCION || !nota.SERIE || !nota.NUMERO_FACTURA) {
    notify('negative', 'Datos incompletos para cargar la nota de crédito para edición.', 4000);
    closeDialog();
    return;
  }

  showLoading('Cargando Nota de Crédito para edición...');
  try {
    const encResult: DevolucionEnc | null = await obtenerDevolucionesEncPorNumero(nota.NUMERO_DEVOLUCION);
    if (!encResult) {
      throw new Error('No se pudo cargar el encabezado de la devolucion.');
    }

    numeroDevolucionNC.value = encResult.NUMERO_DEVOLUCION;
    serie.value = encResult.SERIE;
    numeroFactura.value = encResult.NUMERO_FACTURA;
    observaciones.value = encResult.OBSERVACIONES;
    isEditing.value = true;

    const resFactura: ApiFacturaResponse | null = await buscarFacturaAPI(
      serie.value,
      numeroFactura.value as number
    );

    if (!resFactura || !resFactura.FACTURA) {
      throw new Error('No se pudo encontrar la factura original asociada a esta devolucion.');
    }
    factura.value = resFactura;

    productosFactura.value = resFactura.FACTURA.DETALLE.map(det => ({
      id: det.ID_FACTURA_DET,
      producto: det.PRODUCT0,
      codigo: det.CODIGO_UNIDAD_VTA,
      cantidad: det.CANTIDAD_VENDIDA,
      precio: det.PRECIO_UNITARIO_VTA,
      cantidadNC: 0,
      editando: false,
      tempOriginalCantidadNC: 0
    }));

    const detResult: DevolucionDet[] = await obtenerDevolucionesDet(numeroDevolucionNC.value);

    if (detResult) {
      productosSeleccionados.value = detResult.map(det => {
        const originalProduct = productosFactura.value.find(p => p.producto.trim() === det.PRODUCT0);
        const cantidadDevuelta = det.CANTIDAD_DEVUELTA || 0;
        return {
          id: det.ID,
          producto: det.PRODUCT0 || 'Producto Desconocido',
          codigo: originalProduct?.codigo || det.PRODUCT0 || '',
          cantidad: originalProduct?.cantidad || 0,
          precio: det.PRECIO_DEVOLUCION || 0,
          cantidadNC: det.CANTIDAD_DEVUELTA || 0,
          editando: false,
          tempOriginalCantidadNC: cantidadDevuelta
        };
      });
    }

    step.value = '2';
    notify('positive', `Nota de Crédito ${numeroDevolucionNC.value} cargada para edición.`, 3000);

  } catch (error: any) {
    console.error('Error al cargar nota para edición:', error);
    notify('negative', `Error al cargar la nota para edición: ${error.message || 'Error desconocido'}.`, 5000);
    closeDialog();
  } finally {
    hideLoading();
  }
}

watch([visible, () => props.notaParaEditar], ([isVisible, notaEdit]) => {
  if (isVisible && notaEdit) {
    resetForm();
    loadNotaForEdit(notaEdit);
  } else if (!isVisible) {
    resetForm();
  }
}, { immediate: true });

// --- Lógica del Paso 1: Buscar Factura
async function buscarFactura() {
  if (isEditing.value) {
    notify('info', 'Estás en modo edición. No se puede buscar una nueva factura.', 3000);
    return;
  }

  if (!serie.value || !numeroFactura.value) {
    notify('warning', 'Por favor, complete la serie y el número de factura para buscar.', 3000);
    return;
  }

  showLoading('Buscando factura...');
  try {
    const res: ApiFacturaResponse | null = await buscarFacturaAPI(
      serie.value,
      numeroFactura.value as number
    );

    if (!res || !res.FACTURA) {
      notify('negative', 'Factura no encontrada. Verifique la serie y número de factura.', 4000);
      return;
    }

    const fechaFacturaRaw = res.FACTURA.FECHA_DE_FACTURA;
    const fechaFactura = (fechaFacturaRaw instanceof Date) ? fechaFacturaRaw : new Date(fechaFacturaRaw as string);

    if (isNaN(fechaFactura.getTime())) {
      throw new Error('Fecha de factura inválida en los datos recibidos.');
    }

    const hoy = new Date();
    const diferenciaMs = hoy.getTime() - fechaFactura.getTime();
    const dias = diferenciaMs / (1000 * 60 * 60 * 24);

    if (dias > 60) {
      notify('negative', 'No se puede emitir una nota de crédito para una factura con más de 60 días de antigüedad.', 5000);
      return;
    }

    if (!props.vendedor || !props.vendedor.CODIGO_VENDEDOR) {
      throw new Error('No se pudo obtener la información del vendedor para crear el encabezado de la devolucion.');
    }

    factura.value = res;
    productosFactura.value = res.FACTURA.DETALLE.map(det => ({
      id: det.ID_FACTURA_DET,
      producto: det.PRODUCT0,
      codigo: det.CODIGO_UNIDAD_VTA,
      cantidad: det.CANTIDAD_VENDIDA,
      precio: det.PRECIO_UNITARIO_VTA,
      cantidadNC: 0,
      editando: false,
      tempOriginalCantidadNC: 0
    }));
    productosSeleccionados.value = [];
    observaciones.value = '';

    if (!isEditing.value) {
      showLoading('Creando encabezado de Devolucion...');
      const encPayload: Partial<DevolucionEnc> = {
        ID_SUCURSAL: factura.value.FACTURA.ID_SUCURSAL?.trim(),
        SERIE: factura.value.FACTURA.SERIE?.trim(),
        NUMERO_FACTURA: factura.value.FACTURA.NUMERO_FACTURA,
        OBSERVACIONES: '',
        USUARIO_QUE_INGRESO: props.vendedor.CODIGO_VENDEDOR.toString(),
        CODIGO_DE_CLIENTE: factura.value.FACTURA.CODIGO_DE_CLIENTE
      };

      const encResult: DevolucionEnc | null = await crearDevolucionEnc(encPayload);

      if (!encResult || !encResult.NUMERO_DEVOLUCION) {
        throw new Error('Error al crear el encabezado de la nota de crédito. No se obtuvo un número de devolución.');
      }
      numeroDevolucionNC.value = encResult.NUMERO_DEVOLUCION;
    }

    step.value = '2';
    notify('positive', 'Factura encontrada y encabezado de devolucion creado. Procede a seleccionar productos.', 3000);

  } catch (error: any) {
    console.error('Error buscando factura o creando encabezado:', error);
    notify('negative', `Ocurrió un error: ${error.message || 'Error desconocido'}. Intente de nuevo más tarde.`, 5000);
    factura.value = null;
    productosFactura.value = [];
  } finally {
    hideLoading();
  }
}

// --- Lógica del Paso 2: Seleccionar Productos
function getMaxCantidad(): number {
  const codigo = codigoInputManual.value.trim().toLowerCase();
  if (!codigo) return 1;

  const productInFactura = productosFactura.value.find(p => p.producto.trim().toLowerCase() === codigo);
  if (productInFactura) {
    const alreadyAddedQuantity = productosSeleccionados.value
      .filter(p => p.producto.trim().toLowerCase() === codigo)
      .reduce((sum, p) => sum + p.cantidadNC, 0);

    return productInFactura.cantidad - alreadyAddedQuantity;
  }
  return 1;
}

async function agregarProducto() {
  const codigo = codigoInputManual.value.trim();
  const cantidad = cantidadInput.value;

  if (!codigo || cantidad <= 0 || isNaN(cantidad)) {
    notify('warning', 'Por favor, ingresa un código de producto y una cantidad válida (mayor a 0).', 3000);
    return;
  }

  if (!numeroDevolucionNC.value) {
    notify('negative', 'No se ha generado un número de devolución para la nota de crédito. Por favor, busque la factura de nuevo.', 5000);
    return;
  }

  const productoOriginal = productosFactura.value.find(p => p.producto.trim().toLowerCase() === codigo.toLowerCase());
  if (!productoOriginal) {
    notify('negative', 'El producto con el código/nombre ingresado no fue encontrado en la factura original. Ingrese el código o nombre exacto del producto de la factura.', 4000);
    return;
  }

  let yaAgregadoIndex = productosSeleccionados.value.findIndex(p =>
    p.producto.trim().toLowerCase() === productoOriginal.producto.trim().toLowerCase()
  );

  let cantidadTotalParaNC = cantidad;
  if (yaAgregadoIndex !== -1) {
    cantidadTotalParaNC = productosSeleccionados.value[yaAgregadoIndex].cantidadNC + cantidad;
  }

  if (cantidadTotalParaNC > productoOriginal.cantidad) {
    notify('warning', `No puedes exceder la cantidad facturada (${productoOriginal.cantidad}) para ${productoOriginal.producto}. Cantidad a agregar: ${cantidad}. Cantidad ya seleccionada: ${yaAgregadoIndex !== -1 ? productosSeleccionados.value[yaAgregadoIndex].cantidadNC : 0}.`, 5000);
    return;
  }

  showLoading('Agregando producto a la devolucion...');
  try {
    let detResult: DevolucionDet | null = null;
    let existingDetalleId: number | null = null;

    if (yaAgregadoIndex !== -1) {
      existingDetalleId = productosSeleccionados.value[yaAgregadoIndex].id;
    }

    const payloadDetalle: DevolucionDet = {
      ID_SUCURSAL: factura.value?.FACTURA.ID_SUCURSAL?.trim() || '',
      SERIE: factura.value?.FACTURA.SERIE?.trim() || '',
      NUMERO_FACTURA: factura.value?.FACTURA.NUMERO_FACTURA || 0,
      NUMERO_DEVOLUCION: numeroDevolucionNC.value,
      PRODUCT0: productoOriginal.producto.trim(),
      CODIGO_DE_BODEGA: 1,
      CANTIDAD_DEVUELTA: cantidadTotalParaNC,
      PRECIO_DEVOLUCION: productoOriginal.precio
    };

    if (existingDetalleId) {
      detResult = await actualizarDevolucionDet(existingDetalleId, payloadDetalle);
    } else {
      detResult = await crearDevolucionDet(payloadDetalle);
    }

    if (!detResult || detResult.ID === undefined || detResult.ID === null) {
      throw new Error(`Error al registrar/actualizar el detalle para el producto "${productoOriginal.producto}". No se obtuvo ID.`);
    }

    if (yaAgregadoIndex !== -1) {
      productosSeleccionados.value[yaAgregadoIndex].cantidadNC = cantidadTotalParaNC;
      productosSeleccionados.value[yaAgregadoIndex].id = detResult.ID;
      productosSeleccionados.value[yaAgregadoIndex].tempOriginalCantidadNC = cantidadTotalParaNC;
      notify('info', `Cantidad de ${productoOriginal.producto} actualizada a ${cantidadTotalParaNC}.`, 2000);
    } else {
      productosSeleccionados.value.push({
        ...productoOriginal,
        id: detResult.ID,
        cantidadNC: cantidad,
        editando: false,
        tempOriginalCantidadNC: cantidad
      });
      notify('positive', `Producto ${productoOriginal.producto} agregado correctamente.`, 2000);
    }

    codigoInputManual.value = '';
    cantidadInput.value = 1;

  } catch (error: any) {
    console.error('Error al agregar/actualizar detalle de producto:', error);
    notify('negative', `Error inesperado al agregar/actualizar el producto: ${error.message || 'Error desconocido'}`, 5000);
  } finally {
    hideLoading();
  }
}

async function validarYGuardarCantidad(producto: ProductoNotaCredito) {
  const originalQuantityFactura = productosFactura.value.find(p => p.producto.trim() === producto.producto.trim())?.cantidad || 0;
  
  let needsUpdate = false;

  if (producto.cantidadNC > originalQuantityFactura) {
    notify('warning', `La cantidad para ${producto.producto} no puede exceder la cantidad facturada (${originalQuantityFactura}). Se ajustó a ${originalQuantityFactura}.`, 3000);
    producto.cantidadNC = originalQuantityFactura;
    needsUpdate = true;
  } else if (producto.cantidadNC <= 0 || isNaN(producto.cantidadNC)) {
    notify('warning', `La cantidad para ${producto.producto} debe ser al menos 1. Se ajustó a 1.`, 3000);
    producto.cantidadNC = 1;
    needsUpdate = true;
  }

  if (producto.cantidadNC !== producto.tempOriginalCantidadNC) {
    needsUpdate = true;
  }

  if (needsUpdate && numeroDevolucionNC.value && producto.id) {
    await updateCantidadFromTable(producto);
    producto.tempOriginalCantidadNC = producto.cantidadNC; 
  }

  producto.editando = false;
}

async function updateCantidadFromTable(producto: ProductoNotaCredito) {
  if (producto.cantidadNC <= 0 || !numeroDevolucionNC.value || !producto.id) {
    notify('negative', 'No se pudo actualizar la cantidad: datos incompletos o inválidos.', 4000);
    producto.editando = false;
    return;
  }

  showLoading('Actualizando cantidad del producto...');
  try {
    const updatePayload = {
      ID: producto.id,
      NUMERO_DEVOLUCION: numeroDevolucionNC.value,
      PRODUCT0: producto.producto.trim(),
      CANTIDAD_DEVUELTA: producto.cantidadNC,
      PRECIO_DEVOLUCION: producto.precio,
    };
    const detResult: DevolucionDet | null = await actualizarDevolucionDet(producto.id, updatePayload);

    if (!detResult) {
      throw new Error(`Error al actualizar la cantidad del producto "${producto.producto}".`);
    }

    notify('positive', `Cantidad de ${producto.producto} actualizada a ${producto.cantidadNC}.`, 2000);
  } catch (error: any) {
    console.error('Error al actualizar cantidad de producto:', error);
    notify('negative', `Error al actualizar la cantidad del producto: ${error.message || 'Error desconocido'}`, 5000);
  } finally {
    hideLoading();
    producto.editando = false;
  }
}

async function eliminarProducto(id: number | null) {
  if (id === null) {
    notify('negative', 'No se puede eliminar el producto porque no tiene un ID de detalle válido.', 4000);
    return;
  }

  const productoAEliminar = productosSeleccionados.value.find(p => p.id === id);

  if (productoAEliminar) {
    $q.dialog({
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar "${productoAEliminar.producto}" de la nota de crédito? Esto también eliminará el registro del detalle en el sistema.`,
      cancel: true,
      persistent: true
    }).onOk(async () => {
      showLoading('Eliminando producto del detalle de nota de crédito...');
      try {
        const deleteResult = await eliminarDevolucionDet(id);

        if (!deleteResult || !deleteResult.ok) {
          throw new Error(deleteResult?.message || 'Error desconocido al eliminar el detalle.');
        }

        productosSeleccionados.value = productosSeleccionados.value.filter(p => p.id !== id);
        notify('info', `${productoAEliminar.producto} ha sido eliminado.`, 2000);

        if (productosSeleccionados.value.length === 0 && step.value === '2') {
          notify('info', 'No quedan productos en la nota de crédito. Considera volver al paso anterior o cerrar.', 4000);
        }

      } catch (error: any) {
        console.error('Error al eliminar detalle de producto:', error);
        notify('negative', `Error al eliminar el producto del sistema: ${error.message || 'Error desconocido'}`, 5000);
      } finally {
        hideLoading();
      }
    });
  }
}

// --- Lógica del Paso 3: Confirmar y Emitir
async function emitirNota() {
  if (productosSeleccionados.value.length === 0 || totalNC.value <= 0) {
    notify('warning', 'Debe agregar al menos un producto válido para emitir la nota de crédito, con un total mayor a 0.', 4000);
    return;
  }

  const erroresCantidades = productosSeleccionados.value.filter(p => p.cantidadNC <= 0 || p.cantidadNC > p.cantidad);
  if (erroresCantidades.length) {
    notify('negative', 'Hay productos con cantidades inválidas (cero, negativa o superior a la facturada). Por favor, corrige las cantidades antes de continuar.', 6000);
    return;
  }

  const productoEnEdicion = productosSeleccionados.value.find(p => p.editando);
  if (productoEnEdicion) {
    notify('warning', `El producto "${productoEnEdicion.producto}" aún está en modo edición. Por favor, finaliza la edición antes de emitir.`, 5000);
    return;
  }

  if (!numeroDevolucionNC.value) {
    notify('negative', 'Error interno: No se ha generado un número de devolución para la nota de crédito.', 5000);
    return;
  }

  $q.dialog({
    title: isEditing.value ? 'Confirmar Guardar Cambios' : 'Confirmar Emisión de Nota de Crédito',
    message: `Se ${isEditing.value ? 'guardarán los cambios en' : 'confirmará'} la Nota de Crédito ${numeroDevolucionNC.value} por un total de <span class="text-negative text-weight-bold">Q ${totalNC.value.toFixed(2)}</span>. ¿Desea continuar?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    showLoading(isEditing.value ? 'Guardando cambios...' : 'Finalizando nota de crédito...');

    try {
      const updateEncPayload: Partial<DevolucionEnc> = {
        OBSERVACIONES: observaciones.value || 'Sin observaciones.',
      };

      const updateResult: DevolucionEnc | null = await actualizarDevolucionEnc(numeroDevolucionNC.value, updateEncPayload);

      if (!updateResult || !updateResult.NUMERO_DEVOLUCION) {
        throw new Error('Error al actualizar el encabezado de la nota de crédito. No se recibió una respuesta válida.');
      }

      const notaFinalizada: DevolucionEnc = {
        NUMERO_DEVOLUCION: numeroDevolucionNC.value,
        SERIE: factura.value?.FACTURA.SERIE?.trim() || '',
        NUMERO_FACTURA: factura.value?.FACTURA.NUMERO_FACTURA || 0,
        TOTAL_DEVOLUCION: totalNC.value,
        OBSERVACIONES: observaciones.value || 'Sin observaciones.',
        USUARIO_QUE_INGRESO: props.vendedor?.CODIGO_VENDEDOR.toString() || '',
        CODIGO_DE_CLIENTE: factura.value?.FACTURA.CODIGO_DE_CLIENTE || 0,
        FECHA_DEVOLUCION: updateResult.FECHA_DEVOLUCION || new Date(),
        FECHA_DE_INGRESO: updateResult.FECHA_DE_INGRESO || new Date(),
        ESTADO_DE_DEVOLUCION: updateEncPayload.ESTADO_DE_DEVOLUCION
      };

      if (isEditing.value) {
        emit('nota-editada', notaFinalizada);
        notify('positive', `¡Nota de Crédito ${numeroDevolucionNC.value} actualizada exitosamente!`, 5000);
      } else {
        emit('nota-creada', notaFinalizada);
        notify('positive', `¡Nota de Crédito ${numeroDevolucionNC.value} emitida exitosamente!`, 5000);
      }
      closeDialog();

    } catch (error: any) {
      console.error('Error al emitir/guardar nota de crédito:', error);
      notify('negative', `Error inesperado al finalizar/guardar la nota de crédito: ${error.message || 'Error desconocido'}`, 7000);
    } finally {
      hideLoading();
    }
  });
}

function closeDialog() {
  resetForm();
  emit('update:modelValue', false);
}
</script>

<style scoped>
.q-stepper {
  box-shadow: none;
}

.container-btn-add {
  height: 53.016px;
}
</style>
