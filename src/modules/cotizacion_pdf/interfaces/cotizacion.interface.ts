export interface ItemFactura {
  cantidad: number;
  descripcion: string;
  precio: string;
  subtotal: string;
}

export interface Cliente {
  nit: string;
  nombre: string;
  direccion: string;
}

export interface Resumen {
  totalPagar: string;
  subtotal?: string;
  descuento?: string;
  totalItems: number;
}

export interface Encabezado {
  uuid?: string;
  serie?: string;
  numero?: string;
  fechaEmision: string;
  tipoDocumento: string;
  serieInterna?: string;
  numeroInterno?: string;
}

export interface DataCotizacion {
  encabezado: Encabezado;
  cliente: Cliente;
  items: ItemFactura[];
  resumen: Resumen;
  nombreVendedor?: string;
  observacion?: string;
}

export interface PdfMakeTableLayoutNode {
  table: {
    body: any[];
  };
}