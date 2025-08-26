import { ref, type Ref } from "vue";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type {
  DataCotizacion,
  ItemFactura,
  PdfMakeTableLayoutNode,
} from "../interfaces/cotizacion.interface.ts";
import QRCode from "qrcode";
import { useDatosFel } from "@/modules/fel_empresa_establecimiento/composables/useFelDatos.js";

// Cargar fuentes
(pdfMake as any).vfs = pdfFonts.vfs;

// Variables de estado
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

// Funcion para truncar el texto a un número máximo de líneas
const truncateTextByLines = (
  text: string,
  maxLines: number,
  charsPerLine: number = 20
): string => {
  if (!text || text.length <= maxLines * charsPerLine) {
    return text;
  }
  const maxLength = maxLines * charsPerLine;
  const ellipsis = "...";
  let truncatedText = text.substring(0, maxLength);
  const lastSpaceIndex = truncatedText.lastIndexOf(" ");
  if (lastSpaceIndex !== -1) {
    truncatedText = truncatedText.substring(0, lastSpaceIndex);
  }
  return truncatedText.trim() + ellipsis;
};

// Función para Generar Cotización en PDF
const generarCotizacionPDF = async (data: DataCotizacion): Promise<boolean> => {
  isGeneratingPdf.value = true;
  pdfMessage.value = "Generando PDF...";
  pdfSuccess.value = false;

  try {
    // Datos de la empresa
    const datosEmpresa = await useDatosFel().obtenerDatosEmpresa(1);
    const nombreComercial = datosEmpresa.NOMBRE_COMERCIAL;
    const razonSocial = datosEmpresa.NOMBRE_EMISOR;
    const direccionEmpresa = datosEmpresa.DIRECCION_EMISOR;
    const nitEmpresa = datosEmpresa.NIT_EMISOR;
    const telefonoEmpresa = datosEmpresa.TELEFONO;

    const leyenda1 = "ESTA COTIZACIÓN ES VÁLIDA POR 30 DÍAS";
    const leyenda2 = "EL MEJOR SURTIDO AL MEJOR PRECIO";
    const leyenda3 = "ES UN PLACER SERVIRLE";
    const leyenda4 = "ESPERAMOS QUE VUELVA";

    if (!data) {
      throw new Error("Los datos de la cotización son nulos o indefinidos.");
    }
    if (!data.items || !data.cliente || !data.resumen) {
      throw new Error(
        "Faltan datos esenciales de la cotización (encabezado, items, cliente o resumen)."
      );
    }
    if (!data.items.length) {
      //console.warn(
      //   "La cotización no contiene ítems. Se generará un PDF sin detalle de productos."
      // );
    }

    const paperWidthInInches = 3.14;
    const paperWidthInPoints = paperWidthInInches * 72;
    const marginHorizontal = 10;
    const marginVertical = 10;
    const rightMargin = 17;
    const contentWidth = paperWidthInPoints - 2 * marginHorizontal;
    const qtyColWidth = 20;
    const priceColWidth = 40;
    const totalColWidth = 40;
    const FONT_SIZE_FOR_DESCRIPTION = 7;
    const desiredLinePercentage = 0.8;
    const desiredLineLength = contentWidth * desiredLinePercentage + 20;
    const lineStartX = (contentWidth - desiredLineLength) / 2 - 5;
    const lineEndX = lineStartX + desiredLineLength;
    const tableBody: any[] = [];
    tableBody.push([
      { text: "CANT", style: "tableHeader", alignment: "center" },
      { text: "DESCRIPCIÓN", style: "tableHeader", alignment: "center" },
      { text: "PRECIO", style: "tableHeader", alignment: "center" },
      { text: "SUBTOTAL", style: "tableHeader", alignment: "center" },
    ]);
    data.items.forEach((item: ItemFactura) => {
      const truncatedDescription = truncateTextByLines(
        item.descripcion || "Sin descripción",
        3
      );
      tableBody.push([
        {
          text: (item.cantidad || 0).toString(),
          alignment: "center",
          style: "tableCell",
        },
        {
          text: truncatedDescription,
          fontSize: FONT_SIZE_FOR_DESCRIPTION,
          style: "tableCell",
        },
        {
          text: item.precio || "Q.0.00",
          alignment: "right",
          style: "tableCell",
        },
        {
          text: item.subtotal || "Q.0.00",
          alignment: "right",
          style: "tableCell",
        },
      ]);
    });

    const docDefinition: any = {
      pageSize: { width: paperWidthInPoints, height: "auto" },
      pageMargins: [
        marginHorizontal,
        marginVertical,
        rightMargin,
        marginVertical,
      ],
      // Comienza la Cotización
      content: [
        // --- SECCIÓN: DATOS DE LA EMPRESA ---
        {
          text: nombreComercial,
          style: "header",
          alignment: "center",
        },
        {
          text: razonSocial,
          style: "subheader",
          alignment: "center",
        },
        {
          text: direccionEmpresa,
          style: "caption",
          alignment: "center",
        },
        {
          text: `NIT: ${nitEmpresa}`,
          style: "caption",
          alignment: "center",
        },
        {
          text: `TELÉFONO: ${telefonoEmpresa}`,
          style: "caption",
          alignment: "center",
        },
        { text: "\n", margin: [0, 0, 0, -6] },
        // --- SECCIÓN: DATOS DE LA COTIZACIÓN ---
        {
          text: `COTIZACIÓN`,
          style: "sectionTitle",
          alignment: "center",
        },
        {
          canvas: [
            {
              type: "line",
              x1: lineStartX,
              y1: 5,
              x2: lineEndX,
              y2: 5,
              lineWidth: 1,
            },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          text: `NÚMERO DE COTIZACIÓN: ${data.encabezado.numeroInterno || ""}`,
          style: "caption",
          alignment: "center",
        },
        {
          text: `FECHA DE EMISIÓN:`,
          style: "caption",
          alignment: "center",
        },
        {
          text: `${data.encabezado.fechaEmision}`,
          style: "caption",
          alignment: "center",
        },
        { text: "\n", margin: [0, 0, 0, -6] },
        // --- SECCIÓN: DATOS DEL CLIENTE ---
        {
          text: "DATOS DEL CLIENTE",
          style: "sectionTitle",
          alignment: "center",
        },
        {
          canvas: [
            {
              type: "line",
              x1: lineStartX,
              y1: 5,
              x2: lineEndX,
              y2: 5,
              lineWidth: 1,
            },
          ],
          margin: [0, 0, 0, 5],
        },
        { text: `CLIENTE:`, style: "caption", alignment: "center" },
        {
          text: `${data.cliente.nombre || "Consumidor Final"}`,
          style: "caption",
          alignment: "center",
        },
        {
          text: `NIT: ${data.cliente.nit || "CF"}`,
          style: "caption",
          alignment: "center",
        },
        { text: `DIRECCIÓN:`, style: "caption", alignment: "center" },
        {
          text: `${data.cliente.direccion || "Ciudad"}`,
          style: "caption",
          alignment: "center",
        },
        { text: "\n", margin: [0, 0, 0, -6] },
        {
          canvas: [
            {
              type: "line",
              x1: lineStartX,
              y1: 5,
              x2: lineEndX,
              y2: 5,
              lineWidth: 1,
            },
          ],
          margin: [0, 0, 0, 5],
        },
        // --- SECCIÓN: TABLA DE DETALLE (ITEMS) ---
        {
          table: {
            headerRows: 1,
            widths: [qtyColWidth, "*", priceColWidth, totalColWidth],
            body: tableBody,
          },
          layout: {
            hLineWidth: function (i: number, node: PdfMakeTableLayoutNode) {
              return 0.5;
            },
            vLineWidth: function (i: number, node: PdfMakeTableLayoutNode) {
              return 0.5;
            },
            hLineColor: function (i: number, node: PdfMakeTableLayoutNode) {
              return "#000";
            },
            vLineColor: function (i: number, node: PdfMakeTableLayoutNode) {
              return "#000";
            },
            paddingLeft: function (i: number, node: PdfMakeTableLayoutNode) {
              return 2;
            },
            paddingRight: function (i: number, node: PdfMakeTableLayoutNode) {
              return 2;
            },
            paddingTop: function (i: number, node: PdfMakeTableLayoutNode) {
              return 2;
            },
            paddingBottom: function (i: number, node: PdfMakeTableLayoutNode) {
              return 2;
            },
          },
          margin: [0, 5],
        },
        { text: "\n", margin: [0, 0, 0, 0] },
        // --- SECCIÓN: RESUMEN Y PIE DE PÁGINA ---
        {
          columns: [],
          margin: [0, 0, 0, 2],
        },
        {
          columns: [
            {
              text: "Total a Pagar:",
              alignment: "right",
              style: "totalsHeader",
              width: "*",
            },
            {
              text: data.resumen.totalPagar,
              alignment: "right",
              style: "totalsHeader",
              width: 60,
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          canvas: [
            {
              type: "line",
              x1: lineStartX,
              y1: 5,
              x2: lineEndX,
              y2: 5,
              lineWidth: 1,
            },
          ],
          margin: [0, 0, 0, 5],
        },
        { text: " ", margin: [0, 5] },
        {
          text: `TOTAL ITEMS: ${data.resumen.totalItems || 0}`,
          style: "smallText",
        },
        {
          text: `COTIZÓ: ${data.nombreVendedor || "Vendedor Desconocido"}`,
          style: "smallText",
        },
        {
          text: `FECHA DE IMPRESIÓN: ${fmtFechaGT.format(new Date())}`,
          style: "smallText",
          margin: [0, 0, 0, 10],
        },
        { text: leyenda1, style: "legend", alignment: "center", bold: true, margin: [0, 20, 0, 2], },
        { text: leyenda2, style: "legend", alignment: "center" },
        { text: leyenda3, style: "legend", alignment: "center" },
        { text: leyenda4, style: "legend", alignment: "center" },
      ], // Fin de la Cotización
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 2],
          color: "#000000",
        },
        subheader: {
          fontSize: 10,
          bold: true,
          margin: [0, 2, 0, 2],
          color: "#000000",
        },
        caption: {
          fontSize: 10,
          bold: false,
          margin: [0, 0, 0, 1],
          color: "#000000",
        },
        captionBold: {
          fontSize: 10,
          bold: true,
          margin: [0, 0, 0, 1],
          color: "#000000",
        },
        smallTextContent: {
          fontSize: 8,
          color: "#000000",
        },
        smallText: { fontSize: 8, color: "#000000" },
        tableHeader: { bold: true, fontSize: 7, color: "#000000" },
        tableCell: {
          fontSize: 7,
          color: "#000000",
        },
        totalsHeader: { fontSize: 11, bold: true, color: "#000000" },
        legend: {
          fontSize: 7,
          italics: true,
          margin: [0, 2, 0, 2],
          color: "#000000",
        },
        sectionTitle: {
          fontSize: 11,
          bold: true,
          margin: [0, 0, 0, 2],
          color: "#000000",
        },
      },
      defaultStyle: { fontSize: 9, color: "#000000" },
    };

    // --- DESCARGAR E IMPRIMIR PDF ---
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      iframe.onload = () => {
        try {
          iframe.contentWindow!.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 1000);
        } catch (error) {
          //console.error("Error al intentar imprimir: ", error);
        }
      };
      document.body.appendChild(iframe);
      pdfSuccess.value = true;
      pdfMessage.value =
        "Cotización PDF generada y enviada a impresión automáticamente.";
    });
    return true;
  } catch (error: any) {
    //console.error("Error general al generar el PDF:", error);
    pdfSuccess.value = false;
    pdfMessage.value = `Error al generar el PDF: ${
      error.message || "Error desconocido"
    }`;
    return false;
  } finally {
    isGeneratingPdf.value = false;
  }
};

export function usePdfCotizacion() {
  return {
    isGeneratingPdf,
    pdfMessage,
    pdfSuccess,
    generarCotizacionPDF,
  };
}
