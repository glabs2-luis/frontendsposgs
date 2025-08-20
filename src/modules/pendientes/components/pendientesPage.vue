<template>
  <q-page class="q-pa-md full-page">
    <q-splitter
      v-model="splitter"
      unit="%"
      vertical
      :limits="[20, 85]"
      class="fit"
    >

      <!-- Pane superior: Facturas Pendientes -->
      <template #before>
        <div class="column fit">
          <div class="col">
            <q-card class="q-pa-md">
              <q-card-section class="q-pa-xs q-ma-none">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-h6">Facturas Pendientes</div>

                  <div class="row q-gutter-sm">
                    <q-btn
                      icon="refresh"
                      label=""
                      color="cyan"
                      @click="Refrescar"
                    />

                    <q-btn
                      label="Certificar"
                      color="primary"
                      @click="certificarAgain"
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
                  :pagination="{ rowsPerPage: 25 }"
                  :rows-per-page-options="[10, 20, 50, 100]"
                  virtual-scroll
                  selection="single"
                  v-model:selected="facturaSeleccionadaArray"
                >
                  <template v-slot:no-data>
                    <div class="full-width text-center" style="padding: 200px 20px">
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
                  :pagination="{ rowsPerPage: 20 }"
                  :rows-per-page-options="[10, 20, 50, 100]"
                  virtual-scroll
                >
                  <template v-slot:no-data>
                    <div class="full-width text-center" style="padding: 200px 20px">
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, watchEffect } from "vue";
import { QTableColumn, useQuasar } from "quasar";
import { useFacturasFel } from "../composables/useFelPendientes";
import { useCertification } from "@/modules/certification/composables/useCertification";
import {
  runWithLoading,
  showConfirmationDialog,
  showErrorNotification,
  showSuccessNotification,
} from "@/common/helper/notification";
import { useStoreSucursal } from "@/stores/sucursal";
import { useSync } from "@/modules/sync/composables/useSync";
import { useFacturasEnc } from "@/modules/facturas_enc/composables/useFacturasEnc";
import { Factura } from "../../notas_credito/interfaces/NotaCredito";
import { usePdfFactura } from "@/modules/facturar_pdf/composables/usePdFactura";

const { obtenerFacturasPorNumeroSerie } = useFacturasEnc();
const storeSucursal = useStoreSucursal();
const { mutateCertificar } = useCertification();
const { facturasErrores, refetchFacturasErrores } = useFacturasFel();
const facturaSeleccionadaArray = ref([]);
const facturaSeleccionada = ref<string | null>(null);
const { mutateCrearSincronizacion } = useSync();
const $q = useQuasar()
const { generarFacturaPDF } = usePdfFactura()
const { obtenerDatosFel } = useFacturasEnc()
const { obtenerFacturasEnc, obtenerDetalleFactura } = useFacturasEnc()
const { data: facturasData, isLoading } = obtenerFacturasEnc()
const splitter = ref(70) // 70% arriba (Pendientes) / 30% abajo (Errores)

// Observa la factura seleccionada
watch(facturaSeleccionadaArray, (newSelection) => {
  if (newSelection.length > 0) {
    const factura = newSelection[0];
    facturaSeleccionada.value = `${factura.NUMERO_FACTURA}-${factura.SERIE}`;
  } else {
    facturaSeleccionada.value = null;
  }
});

// Formato de fecha
const formatearFecha = (fechaISO: string) => {
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
};

// Agrupar facturas únicas (por número y serie)
const facturasPendientes = computed(() => {
  const unicas: Record<string, any> = {};
  facturasErrores.value?.forEach((factura) => {
    const key = `${factura.NUMERO_FACTURA}-${factura.SERIE}`;
    if (!unicas[key]) {
      unicas[key] = factura;
    }
  });
  return Object.values(unicas);
});

// Filtrar errores según la factura seleccionada
const facturasConErrores = computed(() => {
  if (!facturaSeleccionada.value) return [];

  const [numeroSel, serieSel] = facturaSeleccionada.value.split("-");

  return (
    facturasErrores.value?.filter(
      (factura) =>
        String(factura.NUMERO_FACTURA).trim() === numeroSel &&
        String(factura.SERIE).trim() === serieSel
    ) || []
  );
});


    const imprimirFactura = async (idFactura: number) => {
    
    try {
      const factura = facturasData.value.find(f => f.ID_FACTURA_ENC === idFactura)
      if (!factura) {
        showErrorNotification('Factura no encontrada','No existe esta factura' )
        return
      }
    
      const datosFelCertificados = await  obtenerDatosFel(factura.NUMERO_FACTURA)
      
      const detalle = await obtenerDetalleFactura(idFactura)
      if (!detalle || detalle.length === 0) {
        return
      }
    
      // Armar los items 
      const itemsFactura = detalle.map((item: any) => ({
        cantidad: item.CANTIDAD_VENDIDA,
        descripcion: item.producto.DESCRIPCION_PROD,
        precio: item.PRECIO_UNITARIO_VTA.toFixed(4),
        subtotal: item.SUBTOTAL_GENERAL.toFixed(4)
      }))
    
      // Calcular total de items
      const totalItems = itemsFactura.reduce((total, item) => total + Number(item.cantidad), 0)
      const Subtotal = itemsFactura.reduce((subtotal, item) => subtotal + Number(item.subtotal), 0)
    
      //fecha de emision
      const fecha = new Date(datosFelCertificados?.FECHA_ACCION)
      const fechaEmisionValida = !isNaN(fecha.getTime()) ? fecha.toLocaleString() : ''
    
      // Armar el objeto dataFactura 
      const dataFactura = {
      
        encabezado: {
          serie: datosFelCertificados?.SERIE_FACTURA_FEL ?? '',
          numero: datosFelCertificados?.NUMERO_FACTURA_FEL ?? '',
          uuid: datosFelCertificados?.UUID ?? '',
          serieInterna: factura.SERIE,
          numeroInterno: factura.NUMERO_FACTURA,
          fechaEmision: fechaEmisionValida,
          tipoDocumento: 'FACTURA ELECTRONICA'
        },
        cliente: {
          nombre: factura.NOMBRE_CLI_A_FACTUAR,
          nit: factura.NIT_CLIEN_A_FACTURAR,
          direccion: factura.DIRECCION_CLI_FACTUR
        },
        items: itemsFactura,
        resumen: {
          subtotal: `Q. ${Subtotal.toFixed(2)}`,
          descuento: `Q ${factura.MONTO_DESCUENTO_FACT.toFixed(2)}`,
          totalPagar: `Q. ${factura.TOTAL_GENERAL.toFixed(2)}`,
          totalItems: totalItems
        },
        nombreVendedor: factura.USUARIO_QUE_FACTURA,
        qrCodeData: datosFelCertificados?.UUID ?? '',
      }
    
      // Generar impresion
       await generarFacturaPDF(dataFactura)
       $q.loading.hide()
    
    } catch (error) {
      console.error('Error reimprimiendo factura:', error)
      showErrorNotification('Error al reimprimir factura', 'Error')
    }
}

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

        // Sincronizar las facturas al server intermedio
        mutateCrearSincronizacion(idFacturaEnc);

        // Refrescar la lista de errores
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
          imprimirFactura(idFacturaEnc)
        
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
  await runWithLoading(
    async () => await refetchFacturasErrores(),
    "Refrescando Facturas"
  );
};

// tabla pendientes - 
const columnasPendientes: QTableColumn[] = [
  { name: "numero", label: "Número", field: "NUMERO_FACTURA", align: "left" },
  { name: "serie", label: "Serie", field: "SERIE", align: "left" },
  { name: "Correlativo", label: "No. Correlativo", field: "CORR_CONTINGENCIA", align: "left"},
  { name: "nombre", label: "Nit", field: "NIT", align: "left"},
  { name: "Nit", label: "Nombre", field: "NOMBRE", align: "left"},
  { name: "Total", label: "Total ", field: "TOTAL_GENERAL", align: "left", format: (val: number) => `Q  ${val.toFixed(2)}` },
  { name: "Fecha", label: "Fecha Facturación", field: "FECHA_ACCION", align: "left", format: formatearFecha},
];

// Tabla que muestra errores
const columnasErrores: QTableColumn[] = [
  { name: "numero", label: "No. Factura", field: "NUMERO_FACTURA", align: "left" },
  { name: "error", label: "Mensaje de Error", field: "ERROR", align: "left" },
];


</script>

<style scoped>

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

.tabla-estilo thead th {
  background: linear-gradient(to right, #1976d2, #2196f3); /* degradado */
  color: white;
  font-weight: bold;
  text-align: center;
}
</style>
