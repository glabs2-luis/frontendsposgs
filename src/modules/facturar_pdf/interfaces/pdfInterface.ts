export interface DataFactura {
  encabezado: EncabezadoFactura;
  cliente: ClienteFactura;
  items: ItemFactura[];
  resumen: ResumenFactura;
  nombreVendedor: string;
  qrCodeData: string;
}

export interface EncabezadoFactura {
  serie: string;
  numero: string;
  uuid: string;
  //fechaEmision: string; // new Date().toISOString()
  numeroInterno: string;
}

export interface ClienteFactura {
  nombre: string;
  nit: string;
  direccion: string;
}

export interface ItemFactura {
  cantidad: number;
  descripcion: string;
  precio: string;
  subtotal: string;
}

export interface ResumenFactura {
  subtotal: string;
  descuento: string;
  totalPagar: string;
  totalItems: number;
}

export interface PdfMakeTableLayoutNode {
    table: {
        body: any[];
    };
}
