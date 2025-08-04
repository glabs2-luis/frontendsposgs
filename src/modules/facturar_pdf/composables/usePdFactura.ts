import { ref, type Ref } from "vue"

import pdfMake from "pdfmake/build/pdfmake"
import * as pdfFonts from "pdfmake/build/vfs_fonts"

import type {
  DataFactura,
  ItemFactura,
  PdfMakeTableLayoutNode,
} from "../interfaces/pdfInterface.ts"
import QRCode from "qrcode"


// Cargar fuentes
(pdfMake as any).vfs = pdfFonts.vfs;

// Variables de estado
const isGeneratingPdf: Ref<boolean> = ref(false);
const pdfMessage: Ref<string> = ref("");
const pdfSuccess: Ref<boolean> = ref(false);

// Funcion para truncar el texto a un número máximo de líneas
const truncateTextByLines = (
  text: string,
  maxLines: number,
  charsPerLineApprox: number = 30,
  lineHeightPoints: number = 10
): string => {
  if (!text || maxLines <= 0) return "";

  const words = text.split(" ");
  let currentLine = "";
  let lineCount = 0;
  let truncatedText = "";
  const ellipsis = "...";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = i + 1 < words.length ? " " + words[i + 1] : "";

    if (
      (currentLine + word).length > charsPerLineApprox &&
      currentLine.length > 0
    ) {
      lineCount++;
      if (lineCount >= maxLines) {
        const remainingSpace = charsPerLineApprox - currentLine.length;
        if (remainingSpace >= ellipsis.length) {
          truncatedText += currentLine + ellipsis;
        } else {
          truncatedText +=
            currentLine.substring(0, currentLine.length - ellipsis.length) +
            ellipsis;
        }
        return truncatedText.trim();
      }
      truncatedText += currentLine + "\n";
      currentLine = word;
    } else {
      currentLine += (currentLine.length > 0 ? " " : "") + word;
    }
  }

  lineCount++;
  if (lineCount > maxLines) {
    if (truncatedText.length === 0) {
      return (
        text.substring(0, charsPerLineApprox * maxLines - ellipsis.length) +
        ellipsis
      );
    } else {
      return (
        truncatedText.trim() +
        "\n" +
        currentLine.substring(0, charsPerLineApprox - ellipsis.length) +
        ellipsis
      );
    }
  }

  return (truncatedText + currentLine).trim();
};

// Función para Generar Factura en PDF
const generarFacturaPDF = async (
  data: DataFactura
): Promise<boolean> => {
  isGeneratingPdf.value = true;
  pdfMessage.value = "Generando PDF...";
  pdfSuccess.value = false;

  try {
    // Variables estáticas
    const documentoTipo = "DOCUMENTO TRIBUTARIO ELECTRONICO";
    const certificadorNombre = "INFILE, S.A.";
    const certificadorNit = "12521337";
    const leyenda1 = "SUJETO A PAGOS TRIMESTRALES ISR";
    const leyenda2 = "EL MEJOR SURTIDO AL MEJOR PRECIO";
    const leyenda3 = "ES UN PLACER SERVIRLE";
    const leyenda4 = "ESPERAMOS QUE VUELVA";

    // Validaciones iniciales de los datos
    if (!data) {
        throw new Error("Los datos de la factura son nulos o indefinidos.");
    }
    if (!data.items || !data.cliente || !data.resumen) {
        throw new Error("Faltan datos esenciales de la factura (encabezado, items, cliente o resumen).");
    }
    if (!data.items.length) {
        console.warn("La factura no contiene ítems. Se generará un PDF sin detalle de productos.");
    }
    if (!data.qrCodeData) {
        console.warn("No se proporcionaron datos para el código QR. El QR podría estar vacío o mostrar un fallback.");
    }
    
    const fechaEmisionDate = new Date();
    const fechaHoraEmision = !isNaN(fechaEmisionDate.getTime())
      ? fechaEmisionDate
          .toLocaleString("es-GT", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(/\//g, "-")
          .replace(",", " ")
      : "Fecha Desconocida";

    // Configuración de pagina
    const paperWidthInInches = 3.14;
    const paperWidthInPoints = paperWidthInInches * 72;
    const marginHorizontal = 18;
    const marginVertical = 4;
    const contentWidth = paperWidthInPoints - 2 * marginHorizontal;

    // Anchos de la columna de la tabla
    const qtyColWidth = 20;
    const priceColWidth = 40;
    const totalColWidth = 40;
    const descriptionColCalculatedWidth = contentWidth - qtyColWidth - priceColWidth - totalColWidth - 8;
    const FONT_SIZE_FOR_DESCRIPTION = 7;
    const APPROX_POINTS_PER_CHAR = 3.8;
    // Ancho total - anchos fijos - (padding_izq * 4 celdas + padding_der * 4 celdas)
    // El 4 * 2 (8) es un estimado para el padding horizontal total que quita espacio
    const charsPerLineForDescription = Math.floor(descriptionColCalculatedWidth / APPROX_POINTS_PER_CHAR);

    // --- CONFIGURACIÓN PARA LÍNEAS CENTRADAS Y MÁS CORTAS ---
    const desiredLinePercentage = 0.8; // % del ancho del contenido
    const desiredLineLength = contentWidth * desiredLinePercentage;
    const lineStartX = (contentWidth - desiredLineLength) / 2;
    const lineEndX = lineStartX + desiredLineLength;

    // console.log(`Ancho total disponible para contenido: ${contentWidth}pt`);
    // console.log(`Ancho calculado para descripción: ${descriptionColCalculatedWidth}pt`);
    // console.log(`Caracteres aprox por línea en descripción: ${charsPerLineForDescription}`);

    // Definicion de la tabla para los items
    const tableBody: any[] = [];
    tableBody.push([
      { text: "CANT", style: "tableHeader", alignment: "center" },
      { text: "DESCRIPCIÓN", style: "tableHeader", alignment: "center" },
      { text: "PRECIO", style: "tableHeader", alignment: "center" },
      { text: "SUBTOTAL", style: "tableHeader", alignment: "center" },
    ]);

    // Llenado de items
    data.items.forEach((item: ItemFactura) => {
        const truncatedDescription = truncateTextByLines(
            item.descripcion || 'Sin descripción',
            3,
            charsPerLineForDescription
        );
        tableBody.push([
            { text: (item.cantidad || 0).toString(), alignment: "center", style: "tableCell" },
            { text: truncatedDescription, fontSize: FONT_SIZE_FOR_DESCRIPTION, style: "tableCell" },
            { text: item.precio || 'Q.0.00', alignment: "right", style: "tableCell" },
            { text: item.subtotal || 'Q.0.00', alignment: "right", style: "tableCell" },
        ]);
    });

    // Genera el Código QR
    let qrDataUrl = "";
    try {
        if (data.qrCodeData) {
            qrDataUrl = await QRCode.toDataURL(data.qrCodeData, {
                errorCorrectionLevel: "H",
                type: "image/png",
                margin: 1,
                scale: 4,
            });
        } else {
            console.warn("`data.qrCodeData` está vacío. Usando QR de fallback.");
            qrDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        }
    } catch (err: any) {
        console.error("Error al generar el QR:", err);
        pdfMessage.value = `Error al generar el PDF (QR): ${err.message || 'Error desconocido'}`;
        qrDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    const docDefinition: any = {
      pageSize: { width: paperWidthInPoints, height: "auto" },
      pageMargins: [
        marginHorizontal,
        marginVertical,
        marginHorizontal,
        marginVertical,
      ],

      content: [
        // --- SECCIÓN: DATOS DE LA EMPRESA ---
        { text: data.empresa.nombreComercial, style: "header", alignment: "center" },
        // { text: nombreComercialLinea2, style: "header", alignment: "center" },
        { text: data.empresa.razonSocial, style: "subheader", alignment: "center" },
        { text: data.empresa.direccionEmpresa, style: "caption", alignment: "center" },
        { text: `NIT: ${data.empresa.nitEmpresa}`, style: "caption", alignment: "center" },
        { text: `TELÉFONO: ${data.empresa.telefonoEmpresa}`, style: "caption", alignment: "center" },
        { text: '\n', margin: [0, 0, 0, -6] },

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
          margin: [0, 0, 0, 5]
        },

        // --- SECCIÓN: DATOS DE LA FACTURA ---
        { text: `DATOS DE LA ${data.encabezado.tipoDocumento}`, style: "sectionTitle", alignment: "center" },
        { text: documentoTipo, style: "caption", alignment: "center" },
        { text: data.encabezado.tipoDocumento, style: "caption", alignment: "center" },

        ...(data.encabezado.tipoDocumento.toUpperCase() === "FACTURA EN CONTINGENCIA" ?
            // Si el tipo de documento es "Documento en contingencia", solo muestra el número.
            [
                { text: `NÚMERO: ${data.encabezado.numero || ''}`, style: "caption", alignment: "center" }
            ] 
            : 
            // De lo contrario, muestra serie, número y número de autorización.
            [
                { text: `SERIE: ${data.encabezado.serie || ''}`, style: "caption", alignment: "center" },
                { text: `NÚMERO: ${data.encabezado.numero || ''}`, style: "caption", alignment: "center" },
                { text: `NÚMERO DE AUTORIZACIÓN: ${data.encabezado.uuid || ''}`, style: "caption", alignment: "center" },
                { text: `FECHA EMISIÓN: ${data.encabezado.fechaEmision}`, style: "caption", alignment: "center" }
            ]
        ),

        { text: `NÚMERO INTERNO: ${data.encabezado.numeroInterno || ''}`, style: "caption", alignment: "center" },
        { text: '\n', margin: [0, 0, 0, -6] },

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
          margin: [0, 0, 0, 5]
        },

        // --- SECCIÓN: DATOS DEL CLIENTE ---
        { text: "DATOS DEL CLIENTE", style: "sectionTitle", alignment: "center" },
        { text: `CLIENTE:`, style: "caption", alignment: "center" },
        { text: `${data.cliente.nombre || 'Consumidor Final'}`, style: "caption", alignment: "center" },
        { text: `NIT: ${data.cliente.nit || 'CF'}`, style: "caption", alignment: "center" },
        { text: `DIRECCIÓN:`, style: "caption", alignment: "center" },
        { text: `${data.cliente.direccion || 'Ciudad'}`, style: "caption", alignment: "center" },
        { text: '\n', margin: [0, 0, 0, -6] },

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
          margin: [0, 0, 0, 5]
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
        { text: '\n', margin: [0, 0, 0, -6] },

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
          margin: [0, 0, 0, 5]
        },

        // --- SECCIÓN: RESUMEN Y PIE DE PÁGINA ---
        {
          columns: [
            {
              text: "Subtotal:",
              alignment: "right",
              style: "smallText",
              width: "*",
            },
            {
              text: data.resumen.subtotal,
              alignment: "right",
              style: "smallText",
              width: 60,
            },
          ],
          margin: [0, 0, 0, 2],
        },
        {
          columns: [
            {
              text: "Descuento:",
              alignment: "right",
              style: "smallText",
              width: "*",
            },
            {
              text: data.resumen.descuento,
              alignment: "right",
              style: "smallText",
              width: 60,
            },
          ],
          margin: [0, 0, 0, 5],
        },
        {
          columns: [
            {
              text: "Total a pagar:",
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
           margin: [0, 0, 0, 3],
           
        },

        { text: " ", margin: [0, 5] }, 

        { text: `TOTAL ITEMS: ${data.resumen.totalItems || 0}`, style: "smallText" },
        {
          text: `LE ATENDIO: ${data.nombreVendedor || 'Vendedor Desconocido'}`,
          style: "smallText",
          margin: [0, 0, 0, 10],
        },

        { text: "DATOS DEL CERTIFICADOR", style: "smallText", bold: true },
        { text: certificadorNombre, style: "smallText" },
        {
          text: `NIT: ${certificadorNit}`,
          style: "smallText",
          margin: [0, 0, 0, 10],
        },

        {
          image: qrDataUrl,
          alignment: "center",
          width: 80,
          margin: [0, 10, 0, 15],
        },

        { text: leyenda1, style: "legend", alignment: "center", bold: true },
        { text: leyenda2, style: "legend", alignment: "center" },
        { text: leyenda3, style: "legend", alignment: "center" },
        { text: leyenda4, style: "legend", alignment: "center" },
      ],

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
        smallText: { fontSize: 8, color: "#000000" },
        tableHeader: { bold: true, fontSize: 7, color: "#000000" },
        tableCell: {
          fontSize: 7,
          color: '#000000',
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

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;

    iframe.onload = () => {
      try {
        iframe.contentWindow!.print();

        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 1000);

      } catch (error) {
        console.error("Error al intentar imprimir: ", error);
      }
    };

    document.body.appendChild(iframe);

    pdfSuccess.value = true;
    pdfMessage.value = "Factura PDF generada y enviada a impresión automáticamente.";
  });

  return true;
    
  } catch (error: any) {
    console.error("Error general al generar el PDF:", error);
    pdfSuccess.value = false;
    pdfMessage.value = `Error al generar el PDF: ${error.message || 'Error desconocido'}`;
    return false;
  } finally {
    isGeneratingPdf.value = false;
  }
};

export function usePdfFactura() {
  return {
    isGeneratingPdf,
    pdfMessage,
    pdfSuccess,
    generarFacturaPDF,
  };
}
