<template>
  <q-page class="q-pa-md">
    <!-- Modal de contraseña -->
    <q-dialog v-model="mostrarModal" style="z-index: auto" persistent>
      <q-card style="width: 340px; height: 210px">
        <q-card-section class="q-pa-md q-pl-md q-ma-none title-card">
          <div class="text-h6 text-bold">
            <q-icon name="lock_open" /> Corte de Caja
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

    <!-- Loading mientras se verifican facturas pendientes -->
    <div
      v-if="loadingFacturasErrores"
      class="flex flex-center"
      style="min-height: 50vh"
    >
      <div class="text-center">
        <q-spinner-dots color="primary" size="50px" />
        <div class="text-h6 text-grey-6 q-mt-md">
          Verificando facturas pendientes...
        </div>
      </div>
    </div>

    <!-- Error al cargar facturas pendientes -->
    <div
      v-else-if="errorFacturasErrores"
      class="flex flex-center"
      style="min-height: 50vh"
    >
      <div class="text-center">
        <q-icon name="error" color="negative" size="50px" />
        <div class="text-h6 text-negative q-mt-md">
          {{ errorFacturasErrores.message }}
        </div>
        <q-btn
          color="primary"
          label="Reintentar"
          @click="() => refetchFacturasErrores()"
          class="q-mt-md"
        />
      </div>
    </div>

    <!-- <div v-else-if="accesoPermitido"> -->
      
      <!-- Contenido de la pagina--> 
       <!-- <div> -->
      <div v-else-if="accesoPermitido">
      
      <!-- Sincronizar Facturas -->
      <q-card flat bordered class="sync-card">
        <q-expansion-item
          icon="sync"
          flat
          bordered
          class="text-h6 text-black sync-expansion"
          label="Sincronizar Facturas"
          header-class="sync-header"
          expand-icon="expand_more"
          expanded-icon="expand_less"
        >
          <template #header>
            <div class="row items-center q-gutter-sm">
              <q-icon name="sync" color="black" size="24px" />
              <span class="text-black text-weight-medium">
                {{
                  archivosErrores?.count > 0
                    ? "Existen facturas pendientes de sincronizar"
                    : "No hay facturas pendientes de sincronizar"
                }}
              </span>

              <q-badge
                v-if="archivosErrores?.count > 0"
                color="red"
                text-color="black"
                :label="archivosErrores.count"
                rounded
                class="sync-badge"
                style="font-size: 1.5rem; font-weight: 700; line-height: 1"
              />
            </div>
          </template>
          <q-separator class="q-my-md" />

          <!-- Información de estado compacta -->
          <q-card-section class="q-pa-md">
            <div class="sync-compact-overview">
              <div class="row items-center justify-between">
                <div class="col-auto">
                  <div class="row items-center q-gutter-sm">
                    <q-icon
                      :name="getConnectionIcon()"
                      size="40px"
                      :color="getConnectionIconColor()"
                    />
                    <div>
                      <div class="text-subtitle2">Estado de Conexión</div>
                      <div class="text-subtitle2 text-weight-bold">
                        {{ getConnectionStatusText() }}
                      </div>
                      <div class="text-caption text-grey-6">
                        {{
                          archivosErrores?.timestamp
                            ? new Date(
                                archivosErrores.timestamp
                              ).toLocaleDateString("es-GT")
                            : "Sin revisión"
                        }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-auto">
                  <div class="sync-mini-counter">
                    <span class="sync-mini-label">
                      Pendientes de sincronizar</span
                    >
                    <span class="sync-mini-number">{{
                      archivosErrores?.count || 0
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Acciones -->
          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md justify-center">
              <div class="col-auto">
                <q-btn
                  :disabled="!estadoConexion?.status"
                  color="yellow-10"
                  icon="sync"
                  label="Sincronizar Ahora"
                  size="lg"
                  class="sync-btn"
                  :loading="isReintentarEnviarArchivosPending"
                  @click="reintentar"
                />
              </div>
            </div>
          </q-card-section>

          <!-- Mensaje informativo -->
          <q-card-section cen class="q-pt-none" v-if="estadoConexion?.status">
            <div class="info-section">
              <q-banner class="bg-blue-1 text-blue-9 q-mb-md" rounded>
                <template #avatar>
                  <q-icon name="sync" color="blue-7" />
                </template>
                <div class="text-body2">
                  <strong>Sincronización automática:</strong> Las facturas se
                  sincronizan automáticamente después de cada factura
                  certificada
                </div>
              </q-banner>

              <q-banner class="bg-green-1 text-green-9" rounded>
                <template #avatar>
                  <q-icon name="touch_app" color="green-7" />
                </template>
                <div class="text-body2">
                  <strong>Sincronización Manual:</strong> Use el botón
                  "Sincronizar Ahora" para forzar una sincronización inmediata
                  de todas las facturas pendientes.
                </div>
              </q-banner>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none" v-else>
            <q-banner class="bg-red-1 text-red-9" rounded>
              <template #avatar>
                <q-icon name="error" color="red-7" />
              </template>
              <div class="text-body2">
                <strong>Estado de la conexión:</strong>
                {{ estadoConexion?.serverConnected }}
              </div>
            </q-banner>
          </q-card-section>
        </q-expansion-item>
      </q-card>

      <q-card flat bordered class="q-mt-sm">
        <!-- Calendario y otras opciones -->

        <q-card-section>
          <!-- Contenedor en fila -->
          <div class="row q-col-gutter-md items-start">
            <!-- Fecha -->
            <div class="col-auto">
              <q-date
                color="yellow-10"
                v-model="rangoFechas"
                range
                :locale="localeEspanol"
                :today-btn="true"
                mask="YYYY-MM-DD"
              />
            </div>

            <!-- Botones de acciones rápidas -->
            <div class="col-auto">
              <div class="q-mb-sm">
                <div class="text-caption text-weight-bold text-grey-7">
                  Acciones Rápidas:
                </div>
              </div>
              <div class="column q-gutter-sm">
                <q-btn
                  class="boton-rapido"
                  label="Ayer"
                  icon="today"
                  size="sm"
                  @click="buscarAyer"
                />
                <q-btn
                  class="boton-rapido"
                  label="Hoy"
                  icon="today"
                  size="sm"
                  @click="buscarHoy"
                />
                <q-btn
                  class="boton-rapido"
                  label="Buscar"
                  icon="search"
                  size="sm"
                  @click="buscarFacturas"
                />
                <q-btn
                  v-if="listaFacturas.length > 0"
                  class="boton-rapido"
                  label="Imprimir"
                  icon="print"
                  size="sm"
                  @click="imprimirTicket"
                />
                <q-btn
                  v-if="listaFacturas.length > 0"
                  class="boton-rapido"
                  label="resumen"
                  icon="receipt_long"
                  size="sm"
                  @click="imprimirTicket2"
                />

              </div>
            </div>

            <!-- Tabla -->
            <div class="col-auto">
              <div v-if="listaFacturas.length" class="ticket-container">
                <!-- Vista previa del ticket -->
                <div ref="ticketRef" class="ticket-preview">
                  <!-- Fecha del ticket -->
                  <div class="ticket-fecha">
                    {{ formatearFechaGT(rangoFechas.from) }}
                    <template
                      v-if="
                        rangoFechas.to && rangoFechas.to !== rangoFechas.from
                      "
                    >
                      al {{ formatearFechaGT(rangoFechas.to) }}
                    </template>
                  </div>

                  <!-- Tabla de facturas -->
                  <table class="ticket-tabla">
                    <thead>
                      <tr>
                        <th>SERIE</th>
                        <th>No.</th>
                        <th>TOTAL</th>
                        <th>Descuento</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(factura, index) in listaFacturas"
                        :key="index"
                      >
                        <td>{{ factura.SERIE }}</td>
                        <td>{{ factura.NUMERO_FACTURA }}</td>
                        <td>Q. {{ factura.TOTAL_GENERAL.toFixed(2) }}</td>
                        <td>
                          Q. {{ factura.MONTO_DESCUENTO_FACT.toFixed(2) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Separador -->
                  <div class="ticket-separador"></div>

                  <!-- Total Final -->
                  <div class="ticket-total">
                    Total: <strong> Q. {{ totalCorte.toFixed(2) }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import {
  runWithLoading,
  showErrorNotification,
  showErrorNotificationInside,
} from "@/common/helper/notification";
import useSeries from "../../fel_establecimiento_series/composables/useSeries";
import { date } from "quasar";
import { useFacturasEnc } from "@/modules/facturas_enc/composables/useFacturasEnc";
import { FacturaEnc } from "@/modules/facturas_enc/interfaces/facturaEncInterface";
import { obtenerTipoVendedor } from "@/modules/notas_credito/action/useNotaCreditoActions";
import { useFacturasFel } from "@/modules/pendientes/composables/useFelPendientes";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useStoreSucursal } from "@/stores/sucursal";
import { useConfiguracionStore } from "@/stores/serie";
import { useSync } from "@/modules/sync/composables/useSync";
import { c } from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";
import { ResumenDia } from "../interfaces/resumenDiaInterfaces";
import { useCupones } from '@/modules/cupones/composables/useCupones';
import { Resultado } from '../../cupones/interfaces/bitacoraInterface';

const storeSerie = useConfiguracionStore();
const $q = useQuasar();
const storeSucursal = useStoreSucursal();
const {
  facturasErrores,
  refetchFacturasErrores,
  isLoading: loadingFacturasErrores,
  error: errorFacturasErrores,
} = useFacturasFel();

// Sync composable
const {
  refetchArchivosCreados,
  archivosTransferidos,
  refetchArchivosTransferidos,
  refetchArchivosErrores,
  mutateReintentarEnviarArchivos,
  archivosErrores,
  estadoConexion,
  isReintentarEnviarArchivosPending,
} = useSync();
const { obtenerFacturasPorFecha } = useFacturasEnc();
const { seriesSucursal, obtenerSeries } = useSeries();
const mostrarPassword = ref(false);
const accesoPermitido = ref(false);
const mostrarModal = ref(false);
const password = ref("");
let fecha = ref<{ from: string; to?: string }>({ from: "" });
const serie = ref("");
const rangoFechas = ref<{ from: string; to?: string }>({ from: "" });
let totalCorte = ref(0); // Calcular total
const ticketRef = ref<HTMLElement | null>(null); // Para impresion
const listaFacturas = ref<FacturaEnc[]>([]);
const router = useRouter();
const serie2 = ref("");
const { todosCupones } = useCupones();
const cantidadCupones = ref(0);

serie2.value = storeSerie.serieSeleccionada;

// Configuración en español para el calendario
const localeEspanol = {
  days: [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ],
  daysShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  months: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  monthsShort: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
};

// Función para verificar facturas pendientes
const verificarFacturasPendientes = () => {
  // Verificar si hay facturas con errores
  if (facturasErrores.value && facturasErrores.value.length > 0) {
    $q.notify({
      icon: "warning",
      message: "No puede acceder a este módulo",
      caption: `Hay ${facturasErrores.value.length} factura(s) pendientes de certificar. Redirigiendo a la sección de pendientes...`,
      color: "orange",
      position: "center",
      actions: [{ label: "Aceptar", color: "white" }],
      timeout: 0, // No se cierra automáticamente
    });

    setTimeout(() => {
      router.replace("/pendientes");
    }, 3000);
    return true; // Hay facturas pendientes
  }
  return false; // No hay facturas pendientes
};

// Mostrar el modal al iniciar la página
onMounted(async () => {
// Esperar a que se carguen las facturas pendientes
  if (loadingFacturasErrores.value) {
    // Si está cargando, esperar a que termine
    await new Promise((resolve) => {
      const unwatch = watch(loadingFacturasErrores, (loading) => {
        if (!loading) {
          unwatch(); // Dejar de observar
          resolve(true);
        }
      });
    });
   }

  // Verificar facturas pendientes
  const hayFacturasPendientes = verificarFacturasPendientes();
  //const hayFacturasPendientes = false // Para pruebas

  // Si no hay facturas pendientes, mostrar modal de contraseña
  if (!hayFacturasPendientes) {
    mostrarModal.value = true;
  }
});

// Watch para verificar facturas pendientes cuando cambien los datos
watch(
  facturasErrores,
  (nuevasFacturas) => {
    if (nuevasFacturas && nuevasFacturas.length > 0 && accesoPermitido.value) {
      // Si el usuario ya tenía acceso pero ahora hay facturas pendientes
      verificarFacturasPendientes();
    }
  },
  { immediate: false }
);

watch(rangoFechas, (nuevo, viejo) => {
  fecha.value = nuevo;
});

const valorUnaFecha = ref(null);

watchEffect(() => {
  valorUnaFecha.value = rangoFechas.value;
});

// Comparar clave para ingresar
const verificarPassword = async () => {
  try {
    const datos = await obtenerTipoVendedor(password.value);

    // Validar si no encontro al vendedor
    if (!datos || !datos.TIPO_VENDEDOR) {
      showErrorNotificationInside(
        "Contraseña incorrecta",
        "Verifique sus credenciales"
      );
      password.value = ""; // Limpiar campo
      return;
    }

    if (datos.TIPO_VENDEDOR === "SA" || "DE" || "AD") {
      // Validar que sea tipo SA
      accesoPermitido.value = true; // Activar acceso
      mostrarModal.value = false;
    } else {
      showErrorNotificationInside(
        "Acceso No Autorizado",
        "Contacte a algun administrador"
      );
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Clave Incorrecta. No encontrada.",
      position: "top",
      timeout: 3000,
    });
    password.value = "";
  }
};

// Cerrar modal
const cancelar = () => {
  mostrarModal.value = false;
};

// Formato de fecha
const formatearFechaGT = (fecha: string) =>
  fecha ? date.formatDate(new Date(fecha + "T00:00:00"), "DD/MM/YYYY") : "";

// Series Disponibles - si habran mas a futuro xd
const seriesOptions = computed(() => {
  return obtenerSeries.value?.map((item: any) => item.SERIE) || [];
});

const seriesOptions2 = [serie2.value];

// Funcion para buscar Facturas
const buscarFacturas = async () => {

  // todos cupones
  // Validaciones
  if (!storeSerie.serieSeleccionada) {
    showErrorNotification("Serie", "Debe seleccionar una serie");
    return;
  }

  try {
    const buscar = {
      fecha_inicial: new Date(rangoFechas.value.from),
      fecha_final: new Date(rangoFechas.value.to),
      serie: storeSerie.serieSeleccionada, // Serie en store
    };

    if (rangoFechas.value.to === undefined) {
      (buscar.fecha_inicial = new Date(valorUnaFecha.value + "T00:00:00")),
        (buscar.fecha_final = new Date(valorUnaFecha.value + "T23:59:59"));
    }

    $q.loading.show({
      message: `Buscando Facturas `,
      spinnerColor: "green",
      spinnerSize: 50,
    });

    // Obtener cantidad de cupones also
    const cupones = await todosCupones(
      buscar.fecha_inicial,
      buscar.fecha_final)
      
      console.log("Cupones: ",cupones)
      console.log("buscar.fecha_inicial ",buscar.fecha_inicial)
      console.log("buscar.fecha_final ",buscar.fecha_final)
      
      cantidadCupones.value = cupones.resultado.length

    const facturas = await obtenerFacturasPorFecha(
      buscar.fecha_inicial,
      buscar.fecha_final,
      buscar.serie
    );

    $q.loading.hide();

    listaFacturas.value = (facturas as any[]) || [];

    // Calcular total
  } catch (error) {
    $q.loading.hide();
    const message = error;
    $q.notify({
      type: "negative",
      message: message,
      position: "center",
      timeout: 3000,
    });
  }
};

// Funciones de acciones rápidas
const buscarHoy = async () => {
  const hoy = new Date();
  const fechaHoy = hoy.toISOString().split("T")[0];

  rangoFechas.value = {
    from: fechaHoy,
    to: fechaHoy,
  };

  await buscarFacturas();
};

const buscarAyer = async () => {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const fechaAyer = ayer.toISOString().split("T")[0];

  rangoFechas.value = {
    from: fechaAyer,
    to: fechaAyer,
  };

  await buscarFacturas();
};

totalCorte = computed(() => {
  return listaFacturas.value.reduce((total, factura) => {
    return total + (factura.TOTAL_GENERAL || 0);
  }, 0);
});

// ===== FUNCIONES HELPER PARA ESTADO DE CONEXIÓN =====

// Función para reintentar sincronización
const reintentar = () => {
  mutateReintentarEnviarArchivos();
};

// Obtener clase CSS para el estado de conexión
const getConnectionStatusClass = () => {
  if (!estadoConexion.value?.status) return "connection-offline";
  return estadoConexion.value.status
    ? "connection-online"
    : "connection-offline";
};

// Obtener icono para el estado de conexión
const getConnectionIcon = () => {
  if (!estadoConexion.value?.status) return "wifi_off";
  return estadoConexion.value.status ? "wifi" : "wifi_off";
};

// Obtener color del icono para el estado de conexión
const getConnectionIconColor = () => {
  if (!estadoConexion.value?.status) return "grey-6";
  return estadoConexion.value.status ? "green-7" : "red-7";
};

// Obtener clase CSS para el texto del estado de conexión
const getConnectionTextClass = () => {
  if (!estadoConexion.value?.status) return "text-grey-6";
  return estadoConexion.value.status ? "text-green-8" : "text-red-8";
};

// Obtener texto del estado de conexión
const getConnectionStatusText = () => {
  if (!estadoConexion.value?.status) return "Desconocido";
  return estadoConexion.value.status ? "Conectado" : "Desconectado";
};

const imprimirTicket2 = () => {

  if (!listaFacturas.value || listaFacturas.value.length === 0) {
    showErrorNotification("Impresión", "No hay facturas para imprimir");
    return;
  }

  // Agrupar facturas por día y serie
  const resumen: Record<string, ResumenDia & { fecha: string; serie: string }> = {};  

  listaFacturas.value.forEach(factura => {
    const fecha = new Date(factura.FECHA_DE_FACTURA).toISOString().split("T")[0];
    const serie = factura.SERIE ?? "SIN SERIE";
    const clave = `${fecha}-${serie}`;

    if (!resumen[clave]) {
      resumen[clave] = { cantidad: 0, total: 0, descuento: 0, fecha, serie };
    }

    resumen[clave].cantidad += 1;
    resumen[clave].total += factura.TOTAL_GENERAL ?? 0;
    resumen[clave].descuento += factura.MONTO_DESCUENTO_FACT ?? 0;
  });

  const cupones = cantidadCupones.value;

  const ventanaImpresion = window.open("", "", "width=600, height=800");

  if (ventanaImpresion) {
    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Resumen de Facturas</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Arial', monospace;
              padding: 20px;
              font-size: 11px;
              width: 80mm;
              max-width: 80mm;
              color: #000;
              text-align: center;
            }
            .titulo {
              text-align: center;
              font-weight: bold;
              margin-bottom: 15px;
              font-size: 14px;
              border-bottom: 1px solid #333;
              padding-bottom: 8px;
              text-transform: uppercase;
            }
            .cupones {
              text-align: center;
              margin: 15px 0;
              font-size: 13px;
              font-weight: bold;
            }
            table {
              width: 95%;
              max-width: 95%;
              margin: auto;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #333;
              padding: 6px;
              font-size: 13px;
              text-align: right;
            }
            th {
              background: #f0f0f0;
              text-align: center;
            }
            td.fecha, td.serie {
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="titulo">RESUMEN DE FACTURAS POR DÍA</div>
          <div class="cupones">Cupones utilizados: ${cupones}</div>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Serie</th>
                <th>Facturas</th>
                <th>Total General</th>
                <th>Total Descuentos</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(resumen)
                .map(
                  (datos) => `
                  <tr>
                    <td class="fecha">${datos.fecha}</td>
                    <td class="serie">${datos.serie}</td>
                    <td>${datos.cantidad}</td>
                    <td>Q. ${datos.total.toFixed(2)}</td>
                    <td>Q. ${datos.descuento.toFixed(2)}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);

    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.print();
    ventanaImpresion.close();
  }
};


// Imprimir nota
const imprimirTicket = () => {
  if (!ticketRef.value) {
    showErrorNotification("Impresión", "No hay contenido para imprimir");
    return;
  }

  const contenido = ticketRef.value.innerHTML;
  const ventanaImpresion = window.open("", "", "width=600,height=800");

  if (ventanaImpresion) {
    ventanaImpresion.document.write(`
  <html>
    <head>
      <title>Ticket de Corte</title>
      <style>
        @page {
          size: auto;
          margin: 0;
        }
        body {
          font-family: 'Arial', monospace;
          padding: 20px;
          font-size: 13px;
          color: #000; /* Texto negro  */
          font-weight: 800; /* Más negrita */
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        th {
          padding: 4px;
          background: #eee;
          border-bottom: 2px solid #000;
          text-align: left;
        }
        td {
          padding: 4px;
          border-bottom: none; 
        }
        .ticket-total {
          margin-top: 15px;
          font-size: 15px;
          font-weight: bold;
          text-align: right;
        }
      </style>
    </head>
    <body>${contenido}</body>
  </html>
`);

    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.print();
    ventanaImpresion.close();
  } else {
    showErrorNotification(
      "Impresión",
      "No se pudo abrir la ventana de impresión"
    );
  }
};
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}

.title-card {
  background-color: #f3cf3f;
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

/* Estilos para el ticket */
.ticket-container {
  min-width: 300px;
  max-width: 400px;
}

.ticket-preview {
  border: 2px dotted #333;
  padding: 20px;
  background-color: #ffffff;
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.4;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-fecha {
  text-align: center;
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
}

.ticket-tabla {
  font-size: 500px;
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.ticket-tabla th {
  padding: 6px 4px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #333;
  font-size: 11px;
  background-color: #f5f5f5;
}

.ticket-tabla td {
  padding: 4px 4px;
  text-align: left;
  font-size: 11px;
  word-wrap: break-word;
  border-bottom: 1px dotted #ddd;
}

.ticket-tabla th:nth-child(3),
.ticket-tabla td:nth-child(3) {
  text-align: right;
}

.ticket-tabla th:nth-child(4),
.ticket-tabla td:nth-child(4) {
  text-align: center;
}

.ticket-separador {
  border-top: 2px dotted #333;
  margin: 15px 0;
}

.ticket-total {
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  border-top: 2px solid #333;
  padding-top: 10px;
  margin-top: 15px;
  background-color: #f9f9f9;
  padding: 10px;
}

/* ===== ESTILOS PARA SINCRONIZACIÓN PROFESIONAL ===== */

.sync-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.sync-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.sync-expansion {
  border-radius: 12px;
  overflow: hidden;
}

.sync-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: black !important;
  font-weight: 600;
  padding: 16px 20px;
  border-radius: 12px 12px 0 0;
}

.sync-header .q-expansion-item__toggle-icon {
  color: black !important;
}

.sync-header .q-expansion-item__toggle-icon:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}

.sync-badge {
  animation: pulse-badge 3s infinite;
}

@keyframes pulse-badge {
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

/* Diseño compacto */
.sync-compact-overview {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.sync-compact-overview:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.sync-mini-counter {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.sync-mini-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1976d2;
  line-height: 1;
}

.sync-mini-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.sync-btn {
  color: yellow;
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.sync-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.4);
}

/* ===== ESTILOS PARA ESTADO DE CONEXIÓN ===== */

.connection-status {
  position: relative;
  overflow: hidden;
}

.connection-status.connection-online {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: rgba(76, 175, 80, 0.3);
}

.connection-status.connection-offline {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: rgba(244, 67, 54, 0.3);
}

.connection-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 100%;
  transition: all 0.3s ease;
}

.connection-indicator.connection-online {
  background: linear-gradient(to bottom, #4caf50, #2e7d32);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.connection-indicator.connection-offline {
  background: linear-gradient(to bottom, #f44336, #c62828);
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

/* ===== ESTILOS PARA SECCIÓN DE INFORMACIÓN ===== */

.info-section {
  padding: 8px 0;
}

.info-section .q-banner {
  border-radius: 8px;
  border-left: 4px solid transparent;
}

.info-section .q-banner:first-child {
  border-left-color: #1976d2;
}

.info-section .q-banner:last-child {
  border-left-color: #388e3c;
}

/* Estilos para botones de acciones rápidas */
.boton-rapido {
  background: linear-gradient(135deg, #fcf96a 0%, #b9a91e 100%);
  color: black;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(207, 210, 25, 0.2);
  transition: all 0.3s ease;
  border: 1px solid rgba(210, 207, 25, 0.3);
  min-width: 80px;
}

.boton-rapido:hover {
  background: linear-gradient(135deg, yellow 0%, orange 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(210, 204, 25, 0.3);
}

.boton-rapido:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(210, 68, 25, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .ticket-container {
    min-width: unset;
    width: 100%;
    max-width: 100%;
  }

  .ticket-preview {
    max-width: 100%;
    padding: 15px;
  }

  .ticket-tabla th,
  .ticket-tabla td {
    padding: 3px 2px;
    font-size: 10px;
  }

  .sync-status-card {
    margin-bottom: 16px;
  }

  .sync-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
