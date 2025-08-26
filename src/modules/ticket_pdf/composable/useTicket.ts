import { ref, type Ref } from "vue";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import JsBarcode from "jsbarcode";
import { useDatosFel } from "@/modules/fel_empresa_establecimiento/composables/useFelDatos.js";

(pdfMake as any).vfs = pdfFonts.vfs;

const isGeneratingPdf: Ref<boolean> = ref(false);
const pdfMessage: Ref<string> = ref("");
const pdfSuccess: Ref<boolean> = ref(false);

const fmtFechaGT = new Intl.DateTimeFormat("es-GT", {
  timeZone: "America/Guatemala",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// 🔹 Generador de código de barras con número debajo
function generarCodigoBarras(numeroPedido: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, numeroPedido, {
        format: "CODE128",
        displayValue: true, // 👈 muestra el número debajo del código
        fontSize: 14,       // tamaño del texto debajo
        textMargin: 2,      // espacio entre código y número
        width: 2,
        height: 60,
      });
      resolve(canvas.toDataURL("image/png"));
    } catch (err) {
      reject(err);
    }
  });
}

// 🔹 Generar ticket básico
const generarTicketPDF = async (numeroPedido: string): Promise<boolean> => {
  isGeneratingPdf.value = true;
  pdfMessage.value = "Generando ticket...";
  pdfSuccess.value = false;

  try {
    const datosEmpresa = await useDatosFel().obtenerDatosEmpresa(1);
    const nombreComercial = datosEmpresa.NOMBRE_COMERCIAL;

    // Código de barras
    const barcodeDataUrl = await generarCodigoBarras(numeroPedido);

    // Ancho del papel térmico 80mm = 226.77 puntos
    const ticketWidth = 80 * 2.83465;

    const docDefinition: any = {
      pageSize: { width: ticketWidth, height: "auto" },
      pageMargins: [10, 10, 10, 10],
      content: [
        { text: "TICKET DE PEDIDO", style: "header", alignment: "center" },
        { image: barcodeDataUrl, alignment: "center", width: 100, margin: [0, 10, 0, 10] },
        { text: `No. Pedido: ${numeroPedido}`, style: "orderText", alignment: "center" },
        { text: `Fecha: ${fmtFechaGT.format(new Date())}`, style: "orderText", alignment: "center" },
      ],
      styles: {
        header: { fontSize: 14, bold: true },
        orderText: { fontSize: 10, margin: [0, 5, 0, 0] },
      },
      defaultStyle: { fontSize: 9 },
    };

    // Crear PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    // 🔹 Imprimir automáticamente
    pdfDocGenerator.getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      iframe.onload = () => {
        try {
          iframe.contentWindow!.print();
        } catch (error) {
          //console.error("Error al intentar imprimir automáticamente:", error);
        }
      };
      document.body.appendChild(iframe);

      // Liberar memoria después
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 3000);
    });

    pdfSuccess.value = true;
    pdfMessage.value = "Ticket generado e impreso automáticamente.";
    return true;
  } catch (error: any) {
    //console.error("Error al generar ticket:", error);
    pdfSuccess.value = false;
    pdfMessage.value = `Error: ${error.message}`;
    return false;
  } finally {
    isGeneratingPdf.value = false;
  }
};

export function usePdfTicket() {
  return {
    isGeneratingPdf,
    pdfMessage,
    pdfSuccess,
    generarTicketPDF,
  };
}

