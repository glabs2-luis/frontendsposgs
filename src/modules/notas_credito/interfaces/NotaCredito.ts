export interface ProductoFactura {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  codigo: string;
}

export interface Factura {
  id: number;
  serie: string;
  numero: number;
  fecha: string;
  cliente: {
    nombre: string;
    nit: string;
  };
  productos: ProductoFactura[];
  total: number;
}

export interface ProductoNotaCredito {
  id: number | null;
  producto: string;
  codigo: string;
  nombreProducto: string;
  cantidad: number;
  precio: number;
  cantidadNC: number;
  editando?: boolean;
  tempOriginalCantidadNC?: number;
}

export interface Cupon {
  ID: number;
  NUMERO_CUPON: string;
  NUMERO_PEDIDO: number;
  SUCURSAL: number;
  VENDEDOR_APLICA: number;
  ESTADO: string;
  FECHA: Date;
}

export interface FacturaDet {
  ID_FACTURA_DET: number;
  ID_SUCURSAL: string;
  SERIE: string;
  NUMERO_FACTURA: number;
  PRODUCT0: string;
  NOMBRE_PRODUCTO?: string,
  CODIGO_UNIDAD_VTA: string;
  CANTIDAD_VENDIDA: number;
  CANTIDAD_DEVUELTA?: number;
  COSTO_UNITARIO_PROD: number;
  PRECIO_UNITARIO_VTA: number;
  MONTO_DESCUENTO_DET?: number;
  PRECIO_ORIGINAL?: number;
  MONTO_IVA?: number;
  SUBTOTAL_VENTAS?: number;
  SUBTOTAL_GENERAL?: number;
  MONTO_DESCUENTO_LINE?: number;
  CORRELATIVO_INGRESO?: number;
}

export interface FacturaEncDetalle {
  ID_FACTURA_ENC: number;
  ID_SUCURSAL: string;
  SERIE: string;
  NUMERO_FACTURA: number;
  FECHA_DE_FACTURA: Date;
  USUARIO_QUE_FACTURA: string;
  MONTO_DESCUENTO_FACT: number;
  IVA_FACTURA: number;
  TOTAL_GENERAL: number;
  NOMBRE_CLI_A_FACTUAR: string;
  NIT_CLIEN_A_FACTURAR: string;
  DIRECCION_CLI_FACTUR: string;
  ESTADO_DE_FACTURA: string;
  CODIGO_DE_CLIENTE: number;
  CODIGO_VENDEDOR: number;
  NUMERO_DE_PEDIDO: number;
  PORC_DESCUENTO_GLOB: number;
  FECHA_ANULACION?: Date;
  USUARIO_ANULACION?: string;
  MOTIVO_ANULACION?: string;
  CORRELATIVO?: number;
  TIPO_CONTRIBUYENTE?: string;
  CORR_CONTINGENCIA?: number;
  ESTADO_CERTIFICACION?: string;
  CORR_CONTINGENCIA_INT?: number;
  DETALLE: FacturaDet[];
  CUPONES: Cupon[];
}

export interface ApiFacturaResponse {
  FACTURA: FacturaEncDetalle;
}

export interface Vendedor {
    CODIGO_VENDEDOR: number;
    NOMBRE_VENDEDOR: string;
    USUARIO:         string;
    PASSWORD?:        string;
    ESTADO_VENDEDOR: string;
    TIPO_VENDEDOR:   string;
}

export interface DevolucionEnc {
  NUMERO_DEVOLUCION?: number;
  ID_SUCURSAL?: string;
  SERIE?: string;
  NUMERO_FACTURA?: number;
  FECHA_DEVOLUCION?: Date;
  ESTADO_DE_DEVOLUCION?: string;
  OBSERVACIONES?: string;
  MONTO_IVA?: number;
  TOTAL_DEVOLUCION?: number;
  FECHA_DE_INGRESO?: Date;
  USUARIO_QUE_INGRESO?: string;
  FECHA_DE_APROBACION?: Date;
  CODIGO_DE_CLIENTE?: number;
  NOMBRE?: string;
  CODIGO_VENDEDOR?: number;
  DEVOLUCION_DET?: DevolucionDet[];
}

export interface DevolucionDet {
  ID?: number;
  ID_SUCURSAL: string;
  SERIE: string;
  NUMERO_FACTURA: number;
  NUMERO_DEVOLUCION: number;
  PRODUCT0: string;
  NOMBRE_PRODUCTO?: string;
  CODIGO_DE_BODEGA: number;
  CANTIDAD_DEVUELTA: number;
  PRECIO_DEVOLUCION: number;
  COSTO_PROMEDIO?: number;
  MONTO_IVA?: number;
  SUB_TOTAL?: number;
}

export interface ApiNotaCreditoResponse  {
  DEVOLUCION_ENC: DevolucionEnc
}

export interface ProductoAlterno {
  ID_PRODUCTOS_ALTERNOS: number;
  PRODUCT0: string;
  CODIGO_BARRA: string;
  FECHA_SYNC_INSERT_UPDATE: Date;
}
