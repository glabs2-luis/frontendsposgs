import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { ref } from 'vue';
import { useDatosFel } from "@/modules/fel_empresa_establecimiento/composables/useFelDatos.js";

// Funciones y datos que puedes necesitar
const isGeneratingPdf = ref(false);
const pdfMessage = ref('');
const pdfSuccess = ref(false);

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

async function generarCodigoBarras(numeroPedido: string) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, numeroPedido, {
        format: "CODE128",
        displayValue: false,
        fontSize: 14,
        textMargin: 2,
        width: 2,
        height: 60,
      });
      resolve(canvas.toDataURL("image/png"));
    } catch (err) {
      reject(err);
    }
  });
}

export async function generarTicketPDF(numeroPedido: number) {
  isGeneratingPdf.value = true;
  pdfMessage.value = "Generando ticket...";
  pdfSuccess.value = false;

  try {
    const datosEmpresa = await useDatosFel().obtenerDatosEmpresa(1);
    
    const nombreComercial = datosEmpresa.NOMBRE_COMERCIAL;
    const barcodeDataUrl = await generarCodigoBarras(numeroPedido.toString());

    const ticketWidth = 80;
    const marginX = 5;
    let currentY = 10;
    
    let contentY = currentY;
    contentY += 5;
    contentY += 60 + 5;
    contentY += 5;
    contentY += 5;
    contentY += 10;
    const finalHeight = contentY;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [ticketWidth, finalHeight],
    });

    currentY = 10;

    doc.setFontSize(14);
    doc.text(nombreComercial.toUpperCase(), doc.internal.pageSize.width / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(10);
    doc.text('TICKET DE PEDIDO', doc.internal.pageSize.width / 2, currentY, { align: 'center' });
    currentY += 5;

    const barcodeImageWidth = doc.internal.pageSize.width - marginX * 2;
    const barcodeImageHeight = 30;
    doc.addImage(barcodeDataUrl as string, 'PNG', marginX, currentY, barcodeImageWidth, barcodeImageHeight);
    currentY += barcodeImageHeight + 5;
    
    doc.text(`No. Pedido: ${numeroPedido}`, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.text(`Fecha: ${fmtFechaGT.format(new Date())}`, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
    currentY += 5;

    // IMPRESIÓN
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    
    iframe.style.display = "none";
    iframe.src = url;

    iframe.onload = () => {
      try {
        iframe.contentWindow.print();
      } catch (error) {
        console.error("Error al intentar imprimir automáticamente:", error);
        pdfMessage.value = "Error al imprimir. Por favor, revisa la consola para más detalles.";
      }
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
    
    document.body.appendChild(iframe);
    
    pdfSuccess.value = true;
    pdfMessage.value = "Ticket generado e impreso automáticamente.";
    return true;
  } catch (error) {
    console.error("Error al generar ticket:", error);
    pdfSuccess.value = false;
    pdfMessage.value = `Error: ${error.message}`;
    return false;
  } finally {
    isGeneratingPdf.value = false;
  }
}

export function usePdfTicket() {
  return {
    isGeneratingPdf,
    pdfMessage,
    pdfSuccess,
    generarTicketPDF,
  };
}
