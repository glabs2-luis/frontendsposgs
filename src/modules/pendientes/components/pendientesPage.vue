<template>
  <q-page class="q-pa-md full-page">
    <q-splitter
      v-model="splitter"
      unit="%"
      vertical
      :limits="[30, 75]"
      class="fit splitter-personalizado"
      separator-style="width: 4px; background: linear-gradient(to bottom, #1976d2, #2196f3); cursor: ew-resize;"
    >
      <template #separator>
        <div class="splitter-controls">
          <q-btn
            icon="arrow_right_left"
            size="sm"
            color="white"
            round
            dense
            @click="toggleSplitterDirection"
            class="splitter-btn"
            title="Mover splitter (click para alternar dirección)"
          />
        </div>
      </template>
      <!-- Pane superior: Facturas Pendientes -->
      <template #before>
        <div class="column fit">
          <div class="col">
            <q-card class="q-pa-md">
              <q-card-section class="q-pa-xs q-ma-none">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="column">
                    <div class="text-h6">Facturas Pendientes</div>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ facturasPendientes.length }} facturas pendientes
                    </div>
                  </div>

                  <div class="row q-gutter-sm">
                    <q-btn
                      icon="swap_horiz"
                      label="Cambiar Nit"
                      color="green"
                      @click="abrirActualizarNit"
                      class="btn-accion"
                    />
                    <q-btn
                      icon="update"
                      label="Nit a CF"
                      color="cyan"
                      @click="cambiarNitFacturaACF"
                      class="btn-accion"
                    />
                    <q-btn
                      icon="refresh"
                      label=""
                      color="blue"
                      @click="Refrescar"
                      class="btn-accion"
                    />

                    <q-btn
                      label="Certificar"
                      color="primary"
                      @click="certificarAgain"
                      class="btn-accion"
                    />
                  </div>
                </div>

                <q-table
                  :rows="facturasPendientes"
                  :columns="columnasPendientes"
                  :row-key="(row) => `${row.NUMERO_FACTURA}-${row.SERIE}`"
                  class="tabla-estilo fill-table"
                  flat
                  bordered
                  dense
                  :pagination="{ rowsPerPage: 20 }"
                  :rows-per-page-options="[10, 15, 25, 50]"
                  selection="single"
                  v-model:selected="facturaSeleccionadaArray"
                  :separator="'cell'"
                  loading-label="Cargando facturas..."
                >
                  <template v-slot:no-data>
                    <div
                      class="full-width text-center"
                      style="padding: 200px 20px"
                    >
                      <q-icon name="inventory_2" size="64px" color="grey-8" />
                      <div class="text-subtitle1 q-mt-sm text-grey-7">
                        No hay Facturas Pendientes
                      </div>
                      <div class="text-caption text-grey-5">
                        Todas las facturas ya fueron certificadas
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>

      <!-- Pane inferior: Errores -->
      <template #after>
        <div class="column fit">
          <div class="col">
            <q-card class="q-pa-md q-pt-xs">
              <q-card-section class="q-pa-xs text-h6">
                Errores

                <q-table
                  :rows="facturasConErrores"
                  :columns="columnasErrores"
                  :row-key="(row) => `${row.NUMERO_FACTURA}-${row.SERIE}`"
                  class="fill-table"
                  flat
                  bordered
                  dense
                  :pagination="{ rowsPerPage: 15 }"
                  :rows-per-page-options="[10, 15, 25, 50]"
                  virtual-scroll
                  :separator="'cell'"
                >
                  <template v-slot:no-data>
                    <div
                      class="full-width text-center"
                      style="padding: 200px 20px"
                    >
                      <q-icon name="inventory_2" size="64px" color="grey-8" />
                      <div class="text-subtitle1 q-mt-sm text-grey-7">
                        Seleccione una Factura
                      </div>
                      <div class="text-caption text-grey-5">
                        Para ver los errores
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>
    </q-splitter>

    <!-- Modal de contraseña -->
    <q-dialog v-model="mostrarModalCambiarNit" style="z-index: auto" persistent>
      <q-card style="width: 340px; height: 210px">
        <q-card-section class="q-pa-md q-pl-md q-ma-none title-card">
          <div class="text-h6 text-bold">
            <q-icon name="lock_open" /> Actualizar NIT
          </div>
        </q-card-section>

        <q-card-section class="q-pa-sm q-mt-none q-ml-md q-mr-md">
          <q-input
            v-model="password"
            label="Ingrese la contraseña"
            autofocus
            @keyup.enter="verificarPassword"
            :type="mostrarPassword ? 'text' : 'password'"
          >
            <template #append>
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="mostrarPassword = !mostrarPassword"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelar" color="black" />
          <q-btn
            label="Ingresar"
            class="boton-amarillo"
            icon-right="arrow_forward"
            @click="verificarPassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para actualizar el Nit -->
    <q-dialog v-model="modalActualizarNit" style="z-index: 9999" persistent>
      <q-card style="width: 500px; height: 560px">
        <q-card-section class="q-pa-md q-pl-md q-ma-none title-card">
          <div class="text-h6 text-bold"><q-icon name="" /> Actualizar NIT</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-px-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                v-model="nitActual"
                label="NIT "
                standout
                dense
                disable
                hint="Nit actual"
                :rules="[() => !!nitActual || 'NIT actual no disponible']"
              >
                <template #prepend><q-icon name="key" /></template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="nombreActual"
                label="Nombre"
                standout
                dense
                disable
                hint="Nombre Actual"
              >
                <template #prepend><q-icon name="person" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md q-pl-md q-ma-none title-card">
          <div class="text-h6 text-bold text-green-8">
            <q-icon name="new" /> Ingrese el nuevo Nit
          </div>
        </q-card-section>

        <!-- Nuevo NIT -->
        <q-card-section class="q-pt-none q-px-md">
          <q-input
            v-model="nuevoNit"
            label="Nuevo NIT"
            dense
            autofocus
            :maxlength="20"
            @keydown.enter.prevent="buscarClienteSat"
          >
            <template #prepend><q-icon name="edit" /></template>
            <template #hint> Solo números y guión. Ej: 1234567-8 </template>
            <template #append>
              <q-btn
                round
                dense
                flat
                icon="cleaning_services"
                @click="nuevoNit = ''"
                :disable="isLoading"
              />
            </template>
          </q-input>
        </q-card-section>

        <!-- Mostrar nuevos Valores -->
        <q-card-section class="q-pt-none q-px-md">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                v-model="mostrarNuevoNit"
                label="NIT"
                standout
                dense
                disable
                hint="Nuevo Nit"
                :rules="[
                  () => !!mostrarNuevoNit || 'No hay datos para este NIT',
                ]"
              >
                <template #prepend><q-icon name="key" /></template>
              </q-input>
            </div>

            <div class="col-12">
              <q-input
                v-model="mostrarNuevoNombre"
                label="Nombre"
                standout
                dense
                disable
                hint="Nuevo Nombre"
              >
                <template #prepend><q-icon name="person" /></template>
              </q-input>
            </div>
          </div>
        </q-card-section>

        <!-- Botones de -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" @click="cancelar2" color="black" />
          <q-btn
            label="Confirmar"
            class="boton-amarillo"
            icon-right="check"
            @click="actualizarNit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { debounce, Notify } from "quasar";
import { QTableColumn, useQuasar } from "quasar";
import { useFacturasFel } from "../composables/useFelPendientes";
import { useCertification } from "@/modules/certification/composables/useCertification";
import {
  runWithLoading,
  showConfirmationDialog,
  showErrorNotification,
  showSuccessNotification,
  showSuccessNotificationInside,
} from "@/common/helper/notification";
import { useStoreSucursal } from "@/stores/sucursal";
import { useSync } from "@/modules/sync/composables/useSync";
import { useFacturasEnc } from "@/modules/facturas_enc/composables/useFacturasEnc";
import { usePdfFactura } from "@/modules/facturar_pdf/composables/usePdFactura";
import { FacturaEnc } from "@/modules/facturas_enc/interfaces/facturaEncInterface";
import { obtenerTipoVendedor } from "@/modules/notas_credito/action/useNotaCreditoActions";
import { showErrorNotificationInside } from "@/common/helper/notification";
import { useValidation } from "@/modules/validation/composables/useValidation";
import { DataFactura } from "../../facturar_pdf/interfaces/pdfInterface";

const nitActual = ref(""); // Modal cambiar Nit
const nombreActual = ref(""); // Modal cambiar Nit
const nuevoNit = ref(""); // Nit a buscar
const mostrarNuevoNit = ref(""); // Mostrar nuevo Nit
const mostrarNuevoNombre = ref(""); // Mostrar nuevo Nombre
const modalActualizarNit = ref(false); // Modal cambiar Nit
const mostrarPassword = ref(false); // Modal cambiar Nit
const password = ref(""); // Modal cambiar Nit
const mostrarModalCambiarNit = ref(false);
const accesoPermitido = ref(false);

const { obtenerFacturasPorNumeroSerie } = useFacturasEnc();
const storeSucursal = useStoreSucursal();
const { mutateCertificar } = useCertification();
const { facturasErrores, refetchFacturasErrores } = useFacturasFel();
const facturaSeleccionadaArray = ref([]);
const facturaSeleccionada = ref<string | null>(null);
const { mutateCrearSincronizacion } = useSync();
const $q = useQuasar();
const { generarFacturaPDF } = usePdfFactura();
const { obtenerDatosFel } = useFacturasEnc();
const {
  obtenerFacturasEnc,
  obtenerDetalleFactura,
  mutateCambiarNitFacturaACF,
} = useFacturasEnc();
const { data: facturasData, isLoading } = obtenerFacturasEnc();
const splitter = ref(60);
const facturaSeleccionadaACF = ref<FacturaEnc | null>(null);
const { mutateActualizarNit } = useFacturasEnc();

// Buscar en la SAT
const empresa = ref("GS");
const tipoDocumento = ref("NIT");
const validador = ref(true);

const { data, DatosSat2 } = useValidation(
  nuevoNit.value,
  tipoDocumento.value,
  validador.value,
  empresa.value
);

// Función para alternar la dirección del splitter
const toggleSplitterDirection = () => {
  if (splitter.value <= 50) {
    // Si está en la mitad izquierda, mover a la derecha
    splitter.value = Math.min(75, splitter.value + 10);
  } else {
    // Si está en la mitad derecha, mover a la izquierda
    splitter.value = Math.max(30, splitter.value - 10);
  }
};

// Cambiar NIT a CF de las facturas que generaron error por nit invalido
const cambiarNitFacturaACF = async () => {
  if (facturaSeleccionada.value === null) {
    showErrorNotification(
      "Seleccione una Factura",
      "Debe de seleccionar una factura"
    );
    return;
  }

  const confirm = await showConfirmationDialog(
    "Cambiar NIT a CF",
    "¿Está seguro de querer cambiar el NIT a CF de la factura seleccionada?",
    "Si",
    "No"
  );

  if (confirm) {
    const [numero, serie] = facturaSeleccionada.value.split("-");

    // Mostrar loading
    $q.loading.show({
      message: "Cambiando datos de la factura...",
      spinnerColor: "orange",
      spinnerSize: 50,
    });

    mutateCambiarNitFacturaACF(
      {
        ID_SUCURSAL: storeSucursal.idSucursal,
        SERIE: serie,
        NUMERO_FACTURA: Number(numero),
      },
      {
        onSuccess: async () => {
          $q.loading.hide();

          // Limpiar caches y refrescar la lista de facturas con errores para ver el cambio
          await refetchFacturasErrores();
          $q.notify({
            message: `NIT a CF actualizado para factura ${numero}-${serie}`,
            color: "green",
            icon: "check",
            timeout: 3000,
          });
          await Refrescar();
        },
        onError: (error) => {
          $q.loading.hide();
          showErrorNotification("Error al cambiar NIT a CF", error.message);
        },
      }
    );
  }
};

const cancelar = () => {
  mostrarModalCambiarNit.value = false; // Cerrar modal
  accesoPermitido.value = false; // Reiniciar acceso
  password.value = ""; // Limpiar contraseña
};

const cancelar2 = () => {
  modalActualizarNit.value = false; // Cerrar modal
  mostrarModalCambiarNit.value = false; // Cerrar modal
};

const buscarClienteSat = async () => {
  $q.loading.show({
    message: "Buscando NIT en SAT...",
    spinnerColor: "green",
    spinnerSize: 50,
  });

  const result = await DatosSat2(
    nuevoNit.value,
    tipoDocumento.value,
    validador.value,
    empresa.value
  );

  $q.loading.hide();
  //console.log('Resultado de la búsqueda SAT:', result);

  if (result.isCertified === true) {
    // Si hay datos, asignarlos a los campos
    mostrarNuevoNit.value = result.data.nit;
    mostrarNuevoNombre.value = result.data.nombre;
  } else {
    mostrarNuevoNit.value = "";
    mostrarNuevoNombre.value = "";
    nuevoNit.value = "";

    // Si no hay datos, mostrar error
    showErrorNotificationInside(
      "NIT no encontrado",
      "Verifique el NIT ingresado"
    );
    return;
  }
};

// Dar acceso al cambio de NIT
const verificarPassword = async () => {
  const datos = await obtenerTipoVendedor(password.value);

  // Validar si no encontro al vendedor
  if (!datos || !datos.TIPO_VENDEDOR) {
    showErrorNotificationInside(
      "Contraseña incorrecta",
      "Verifique sus credenciales"
    );
    password.value = ""; // Limpiar contraseña
    return;
  }

  if (datos.TIPO_VENDEDOR === "SA") {
    // Validar que sea tipo SA

    modalActualizarNit.value = true; // Mostrar modal
    mostrarModalCambiarNit.value = false;
  } else {
    showErrorNotificationInside(
      "Acceso No Autorizado",
      "Contacte a algun administrador"
    );
  }
};

const id_factura_enc = ref(0);

const abrirActualizarNit = async () => {
  // Validar si hay una factura seleccionada
  if (facturaSeleccionada.value === null) {
    showErrorNotification(
      "Seleccione una Factura",
      "Debe de seleccionar una factura"
    );
    return;
  }

  console.log("Factura seleccionada:", facturaSeleccionada.value);

  // obtener los datos actuales
  const [numero, serie] = facturaSeleccionada.value.split("-");
  const numero2 = Number(numero);

  const datosFac = await obtenerFacturasPorNumeroSerie(numero2, serie);

  // setear y mostrar los datos actuales
  nitActual.value = datosFac[0].NIT_CLIEN_A_FACTURAR || "";
  nombreActual.value = datosFac[0].NOMBRE_CLI_A_FACTUAR || "";

  id_factura_enc.value = datosFac[0].ID_FACTURA_ENC;

  nextTick();
  mostrarModalCambiarNit.value = true; // Mostrar modal
};

// actualizar Nit
const actualizarNit = async () => {
  console.log("Actualizar Nit para factura ID:", id_factura_enc.value);

  $q.loading.show({
    message: "Actualizando NIT...",
    spinnerColor: "green",
    spinnerSize: 50,
  });

  // Llamar a la mutación para actualizar el NIT
  await mutateActualizarNit(
    {
      id: id_factura_enc.value,
      nit: mostrarNuevoNit.value,
      nombre: mostrarNuevoNombre.value,
    },
    {
      onSuccess: async () => {
        // Cerrar el loading
        $q.loading.hide();

        // Actualizar Tabla
        await refetchFacturasErrores();

        nextTick();

        password.value = ""; // Limpiar contraseña
        mostrarNuevoNit.value = ""; // Limpiar nuevo NIT
        mostrarNuevoNombre.value = "";

        showSuccessNotificationInside("Exito", "NIT actualizado con exito");
        modalActualizarNit.value = false; // Cerrar modal
      },

      onError: (error) => {
        showErrorNotificationInside("Error al actualizar NIT", error.message);
        password.value = ""; // Limpiar contraseña
        // Terminar el Loading
        $q.loading.hide();
      },
    }
  );
};

// Función de selección optimizada con debounce
const actualizarFacturaSeleccionada = debounce((newSelection: any[]) => {
  if (newSelection.length > 0) {
    const factura = newSelection[0];
    const newKey = `${factura.NUMERO_FACTURA}-${factura.SERIE}`;

    // Solo actualizar si realmente cambió
    if (facturaSeleccionada.value !== newKey) {
      facturaSeleccionada.value = newKey;
    }
  } else {
    facturaSeleccionada.value = null;
  }
}, 100); // 100ms de debounce

// Observa la factura seleccionada - optimizado
watch(
  facturaSeleccionadaArray,
  (newSelection) => {
    actualizarFacturaSeleccionada(newSelection);
  },
  { deep: false, flush: "post" }
);

// Función para limpiar caches
const limpiarCaches = () => {
  facturasPendientesCache.value.clear();
  erroresCache.value.clear();
};

// Formato de fecha
const formatearFecha = (fechaISO: string) => {
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
};

// Cache para facturas pendientes únicas
const facturasPendientesCache = ref<Map<string, any>>(new Map());

// Agrupar facturas únicas (por número y serie) - optimizado
const facturasPendientes = computed(() => {
  if (!facturasErrores.value) return [];

  // Solo recalcular si cambió el array de errores
  const currentLength = facturasErrores.value.length;
  const cacheKey = `length_${currentLength}`;

  if (facturasPendientesCache.value.has(cacheKey)) {
    return facturasPendientesCache.value.get(cacheKey);
  }

  const unicas = new Map<string, any>();
  for (const factura of facturasErrores.value) {
    const key = `${factura.NUMERO_FACTURA}-${factura.SERIE}`;
    if (!unicas.has(key)) {
      unicas.set(key, factura);
    }
  }

  const result = Array.from(unicas.values());
  facturasPendientesCache.value.set(cacheKey, result);
  return result;
});

// Cache para errores filtrados
const erroresCache = ref<Map<string, any[]>>(new Map());

// Filtrar errores según la factura seleccionada - optimizado
const facturasConErrores = computed(() => {
  if (!facturaSeleccionada.value) return [];

  const cacheKey = facturaSeleccionada.value;
  if (erroresCache.value.has(cacheKey)) {
    return erroresCache.value.get(cacheKey);
  }

  const [numeroSel, serieSel] = facturaSeleccionada.value.split("-");
  const result =
    facturasErrores.value?.filter(
      (factura) =>
        String(factura.NUMERO_FACTURA).trim() === numeroSel &&
        String(factura.SERIE).trim() === serieSel
    ) || [];

  erroresCache.value.set(cacheKey, result);
  return result;
});

const imprimirFactura = async (idFactura: number) => {
  try {
    const factura = facturasData.value.find(
      (f) => f.ID_FACTURA_ENC === idFactura
    );
    if (!factura) {
      showErrorNotification("Factura no encontrada", "No existe esta factura");
      return;
    }

    const datosFelCertificados = await obtenerDatosFel(factura.NUMERO_FACTURA);

    const detalle = await obtenerDetalleFactura(idFactura);
    if (!detalle || detalle.length === 0) {
      return;
    }

    // Armar los items
    const itemsFactura = detalle.map((item: any) => ({
      cantidad: item.CANTIDAD_VENDIDA,
      descripcion: item.producto.DESCRIPCION_PROD,
      precio: item.PRECIO_UNITARIO_VTA.toFixed(4),
      subtotal: item.SUBTOTAL_GENERAL.toFixed(4),
    }));

    // Calcular total de items
    const totalItems = itemsFactura.reduce(
      (total, item) => total + Number(item.cantidad),
      0
    );
    const Subtotal = itemsFactura.reduce(
      (subtotal, item) => subtotal + Number(item.subtotal),
      0
    );

    //fecha de emision
    const fecha = new Date(datosFelCertificados?.FECHA_ACCION);
    const fechaEmisionValida = !isNaN(fecha.getTime())
      ? fecha.toLocaleString()
      : "";

    // Armar el objeto dataFactura
    const dataFactura = {
      encabezado: {
        serie: datosFelCertificados?.SERIE_FACTURA_FEL ?? "",
        numero: datosFelCertificados?.NUMERO_FACTURA_FEL ?? "",
        uuid: datosFelCertificados?.UUID ?? "",
        serieInterna: factura?.SERIE ?? "",
        numeroInterno: factura?.NUMERO_FACTURA ?? 0,
        fechaEmision: fechaEmisionValida,
        tipoDocumento: "FACTURA ELECTRONICA",
      },
      cliente: {
        nombre: factura.NOMBRE_CLI_A_FACTUAR,
        nit: factura.NIT_CLIEN_A_FACTURAR,
        direccion: factura.DIRECCION_CLI_FACTUR,
      },
      items: itemsFactura,
      resumen: {
        subtotal: `Q. ${Subtotal.toFixed(2)}`,
        descuento: `Q ${factura.MONTO_DESCUENTO_FACT.toFixed(2)}`,
        totalPagar: `Q. ${factura.TOTAL_GENERAL.toFixed(2)}`,
        totalItems: totalItems,
      },
      nombreVendedor: factura.USUARIO_QUE_FACTURA,
      qrCodeData: datosFelCertificados?.UUID ?? "",
    };

    // Generar impresion
    await generarFacturaPDF(dataFactura);
    $q.loading.hide();
  } catch (error) {
    console.error("Error reimprimiendo factura:", error);
    showErrorNotification("Error al reimprimir factura", "Error");
  }
};

// Intentar certificar
const certificarAgain = async () => {
  if (facturaSeleccionada.value === null) {
    showErrorNotification(
      "Seleccione una Factura",
      "Debe de seleccionar una factura"
    );
    return;
  }

  const [numero, serie] = facturaSeleccionada.value.split("-");
  const numero2 = Number(numero);

  // Obtener el ID_FACTURA_ENC
  const datosFac = await obtenerFacturasPorNumeroSerie(numero2, serie);

  const idFacturaEnc = datosFac[0].ID_FACTURA_ENC;
  //console.log("idFacturaEnc", idFacturaEnc);

  // Mostrar loading para certificación
  $q.loading.show({
    message: "Certificando factura...",
    spinnerColor: "green",
    spinnerSize: 50,
  });

  mutateCertificar(
    { sucursal: storeSucursal.idSucursal, serie, numero: numero2 },
    {
      onSuccess: async (data) => {
        // Ocultar loading antes de continuar, por que nos aseguramos que se haya certificado
        $q.loading.hide();

        await refetchFacturasErrores();

        // Sincronizar las facturas al server intermedio
        mutateCrearSincronizacion(idFacturaEnc);

        // Limpiar caches y refrescar la lista de errores
        limpiarCaches();
        await refetchFacturasErrores();

        const confirmar = await showConfirmationDialog(
          "Certificado con exito",
          "Desea imprimir la factura?",
          "Si",
          "No"
        );

        if (confirmar) {
          // Mostrar loading para certificación
          $q.loading.show({
            message: "Imprimiendo Factura",
            spinnerColor: "green",
            spinnerSize: 50,
          });

          // imprimir
          imprimirFactura(idFacturaEnc);
        }
        facturaSeleccionada.value = null;
      },
      onError: (error) => {
        // Ocultar loading en caso de error
        $q.loading.hide();
        showErrorNotification("Error en certificación", error.message);
      },
    }
  );
};

// Recargar el error
const Refrescar = async () => {
  // Limpiar caches antes de refrescar
  limpiarCaches();

  await runWithLoading(() => refetchFacturasErrores(), "Refrescando Facturas");
};

// tabla pendientes -
const columnasPendientes: QTableColumn[] = [
  {
    name: "numero",
    label: "Número",
    field: "NUMERO_FACTURA",
    align: "left",
    style: "width: 70px; min-width: 70px;",
  },
  {
    name: "serie",
    label: "Serie",
    field: "SERIE",
    align: "left",
    style: "width: 60px; min-width: 60px;",
  },
  {
    name: "Correlativo",
    label: "Contingencia",
    field: "CORR_CONTINGENCIA",
    align: "left",
    style: "width: 80px; min-width: 80px;",
  },
  {
    name: "nit",
    label: "NIT",
    field: "NIT",
    align: "left",
    style: "width: 100px; min-width: 100px;",
  },
  {
    name: "nombre",
    label: "Cliente",
    field: "NOMBRE",
    align: "left",
    style: "width: 150px; min-width: 140px;",
  },
  {
    name: "Total",
    label: "Total",
    field: "TOTAL_GENERAL",
    align: "right",
    format: (val: number) => `Q ${val.toFixed(2)}`,
    style: "width: 90px; min-width: 90px;",
  },
  {
    name: "Fecha",
    label: "Fecha",
    field: "FECHA_ACCION",
    align: "center",
    format: formatearFecha,
    style: "width: 100px; min-width: 100px;",
  },
];

// Tabla que muestra errores
const columnasErrores: QTableColumn[] = [
  {
    name: "error",
    label: "Mensaje de Error",
    field: "ERROR",
    align: "left",
    style: "width: 400px; min-width: 350px;",
  },
];
</script>

<style scoped>
.tabla-estilo thead th {
  background: linear-gradient(to right, #1976d2, #2196f3); /* degradado */
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 8px 4px !important;
  font-size: 0.85rem;
}

/* Tabla más compacta */
.tabla-estilo tbody td {
  padding: 6px 4px !important;
  font-size: 0.9rem;
}

/* Reducir espaciado entre columnas */
.tabla-estilo .q-table__container {
  border-spacing: 0;
}

/* Hacer la tabla más densa */
.tabla-estilo .q-table__top,
.tabla-estilo .q-table__bottom {
  padding: 8px 16px;
}

/* Estilos para la tabla de errores también */
.fill-table thead th {
  padding: 8px 4px !important;
  font-size: 0.85rem;
}

.fill-table tbody td {
  padding: 6px 4px !important;
  font-size: 0.9rem;
}

/* Hacer las tablas más compactas globalmente */
.q-table {
  font-size: 0.9rem;
}

.q-table .q-table__top {
  padding: 8px 16px;
}

.q-table .q-table__bottom {
  padding: 8px 16px;
}

/* Reducir el espaciado entre filas */
.q-table tbody tr {
  height: 40px;
}

/* Hacer los separadores más sutiles */
.q-table .q-table__separator {
  background: #e0e0e0;
}

/* Estilos específicos para la tabla de errores */
.fill-table {
  min-height: 300px;
}

.fill-table .q-table__container {
  height: 100%;
}

/* Hacer que la tabla de pendientes sea más compacta */
.tabla-estilo {
  max-width: 100%;
  overflow-x: auto;
}

/* Responsive para pantallas pequeñas */
@media (max-width: 1200px) {
  .tabla-estilo .q-table__container {
    font-size: 0.8rem;
  }

  .fill-table .q-table__container {
    font-size: 0.85rem;
  }
}

/* Estilos personalizados para el splitter */
.splitter-personalizado {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.splitter-personalizado .q-splitter__separator {
  background: linear-gradient(to bottom, #1976d2, #2196f3) !important;
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
}

.splitter-personalizado .q-splitter__separator:hover {
  background: linear-gradient(to bottom, #1565c0, #1976d2) !important;
  transform: scaleX(1.2);
  box-shadow: 0 0 10px rgba(25, 118, 210, 0.5);
}

.splitter-personalizado .q-splitter__separator::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1px;
}

/* Estilos para los panes del splitter */
.splitter-personalizado .q-splitter__before,
.splitter-personalizado .q-splitter__after {
  transition: all 0.3s ease;
}

/* Indicador visual del splitter */
.splitter-personalizado .q-splitter__separator::after {
  content: "⋮";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Animación de carga para el splitter */
.splitter-personalizado .q-splitter__separator {
  animation: splitterGlow 2s ease-in-out infinite alternate;
}

@keyframes splitterGlow {
  0% {
    box-shadow: 0 0 5px rgba(25, 118, 210, 0.3);
  }
  100% {
    box-shadow: 0 0 15px rgba(25, 118, 210, 0.6);
  }
}

/* Estilos para el contenedor principal */
.full-page {
  background: #ffffff;
  min-height: 100vh;
}

/* Mejorar las tarjetas dentro del splitter */
.splitter-personalizado .q-card {
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  background: #ffffff;
}

.splitter-personalizado .q-card:hover {
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

/* Estilos para los botones de acción */
.btn-accion {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-accion:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-accion:active {
  transform: translateY(0);
}

/* Mejorar el header de la página */
.text-h6 {
  color: #1976d2;
  font-weight: 700;
}

/* Estilos para el botón único del splitter */
.splitter-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  will-change: transform;
}

/* Optimizaciones de rendimiento para la tabla */
.tabla-estilo {
  contain: layout style paint;
  will-change: scroll-position;
}

.fill-table {
  contain: layout style paint;
  will-change: scroll-position;
}

.splitter-btn {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #1976d2, #2196f3) !important;
}

/* Transición suave para el cambio de icono */
.splitter-btn .q-icon {
  transition: transform 0.3s ease;
  font-size: 18px !important;
}

.splitter-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.splitter-btn:hover .q-icon {
  transform: rotate(180deg);
}

.splitter-btn:active {
  transform: scale(0.95);
}

/* Ajustar el separador para acomodar el botón bidireccional */
.splitter-personalizado .q-splitter__separator {
  min-width: 12px !important;
  width: 12px !important;
}

.boton-amarillo {
  background: linear-gradient(90deg, #ffeb3b, #fbc02d);
  color: #070606;
  font-weight: 500;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.boton-amarillo:hover {
  background: linear-gradient(90deg, #fbc02d, #f9a825);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}
</style>
