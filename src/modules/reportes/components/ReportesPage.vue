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

    <!-- Contenido de la pagina-->
    <div v-if="accesoPermitido">
      <q-card flat bordered class="q-pa-md q-mt-sm">
        <q-card-section class="q-pa-xs q-ma-xs text-h6" color="primary">
          Corte de Caja

          <q-separator></q-separator>
        </q-card-section>

        <!-- Calendario y otras opciones -->

        <q-card-section>
          <div class="text-h6">
            Rango de fechas:
            {{
              `${formatearFechaGT(rangoFechas.from)} - ${formatearFechaGT(
                rangoFechas.to
              )}`
            }}
          </div>
          <!-- Contenedor en fila -->
          <div class="row q-col-gutter-md q-mt-md items-start">
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

            <!-- Serie -->
            <div class="col-auto q-ma-md">
              <q-select
                v-model="serie"
                :options="seriesOptions"
                label="Seleccionar Serie"
                option-label="SERIE"
                option-value="SERIE"
                style="width: 250px"
                emit-value
                map-options
                autofocus
              />

              <!-- Botón Buscar Facturas -->
              <q-btn
                class="q-pa-sm q-mt-md boton-amarillo"
                label="Buscar"
                @click="buscarFacturas"
              />

              <!-- PImprimir -->
              <div v-if="listaFacturas.length > 0" class="col-auto q-ma-md">
                <div class="text-center q-mb-md">
                  <q-btn
                    align="left"
                    class="boton-amarillo"
                    label="Imprimir"
                    color="black"
                    @click="imprimirTicket"
                  />
                </div>
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
import { showConfirmationInsideModal } from "../../../common/helper/notification";

const $q = useQuasar();

const { facturasErrores, refetchFacturasErrores } = useFacturasFel();
const { obtenerFacturasPorFecha } = useFacturasEnc();
const { seriesSucursal } = useSeries();
const mostrarPassword = ref(false);
const accesoPermitido = ref(false);
const mostrarModal = ref(false);
const password = ref("");
let fecha = ref<{ from: string; to?: string }>({ from: "" });
const { data: series } = seriesSucursal(1);
const serie = ref("");
const rangoFechas = ref<{ from: string; to?: string }>({ from: "" });
let totalCorte = ref(0); // Calcular total
const ticketRef = ref<HTMLElement | null>(null); // Para impresion
const listaFacturas = ref<FacturaEnc[]>([]);

const router = useRouter();

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

// Mostrar el modal al iniciar la página
onMounted(() => {
  if (facturasErrores.value) {
    $q.notify({
      icon: "warning",
      message: "No puede acceder a este modulo",
      caption:
        "Hay facturas pendientes de certificar, redirigiendo a la sección de pendientes...",
      color: "blue-10",
      position: "center",
      actions: [{ label: "Aceptar", color: "blue-10" }],
    });
    setTimeout(() => {
      router.replace("/pendientes");
    }, 5000);
  } else {
    mostrarModal.value = true;
  }
});

watch(rangoFechas, (nuevo, viejo) => {
  //console.log('Este es el valor nuevo', nuevo)
  //console.log('Este es el valor viejo', viejo)

  fecha.value = nuevo;
  //console.log('guardando valor desde nuevo', fecha.value  )
});

const valorUnaFecha = ref(null);

watchEffect(() => {
  //console.log('Valor detectado: ', rangoFechas.value)
  valorUnaFecha.value = rangoFechas.value;
  //console.log('este es valor de rangoFechas en watchEffect', rangoFechas.value.from)
  //console.log('este es valor de rangoFechas en watchEffect', rangoFechas.value.to)
});

// Comparar clave para ingresar
const verificarPassword = async () => {
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

  if (datos.TIPO_VENDEDOR === "SA") {
    // Validar que sea tipo SA
    accesoPermitido.value = true; // Activar acceso
    mostrarModal.value = false;
  } else {
    showErrorNotificationInside(
      "Acceso No Autorizado",
      "Contacte a algun administrador"
    );
  }
};

// Cerrar modal
const cancelar = () => {
  mostrarModal.value = false;
};

// Formato de fecha
const formatearFechaGT = (fecha: string) =>
  fecha ? date.formatDate(new Date(fecha + "T00:00:00"), "DD/MM/YYYY") : "";

// Series Disponibles
const seriesOptions = computed(() => {
  return series.value?.map((item: any) => item.SERIE) || [];
});

// Funcion para buscar Facturas
const buscarFacturas = async () => {
  // Validaciones
  if (!serie.value) {
    showErrorNotification("Serie", "Debe seleccionar una serie");
    return;
  }

  try {
    //console.log('fecha antes', rangoFechas.value.from)
    //console.log('fecha despues', rangoFechas.value.to)

    // Validar is no hay fecha still pending
    //   if (rangoFechas.value.from ===  && !rangoFechas.value.to) {
    //   showErrorNotification('Rango de Fechas', 'Debe seleccionar un rango de fechas válido')
    //   return
    // }

    const buscar = {
      fecha_inicial: new Date(rangoFechas.value.from),
      fecha_final: new Date(rangoFechas.value.to),
      serie: serie.value,
    };

    if (rangoFechas.value.to === undefined) {
      (buscar.fecha_inicial = new Date(valorUnaFecha.value + "T00:00:00")),
        (buscar.fecha_final = new Date(valorUnaFecha.value + "T23:59:59"));
    }

    //console.log('buscar datos:', buscar)

    const facturas = await runWithLoading(
      async () =>
        await obtenerFacturasPorFecha(
          buscar.fecha_inicial,
          buscar.fecha_final,
          buscar.serie
        ),
      "Cargando Facturas"
    );
    //console.log('facturas: ', facturas)

    listaFacturas.value = (facturas as any[]) || [];

    // Calcular total
  } catch (error) {
    const message = error;
    showErrorNotification("Error", message);
  }
};

totalCorte = computed(() => {
  return listaFacturas.value.reduce((total, factura) => {
    return total + (factura.TOTAL_GENERAL || 0);
  }, 0);
});

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
}
</style>
