export interface PedidosDet {
    ID_PEDIDO_ENC?:        string;
    ID_PEDIDO_DET?:        string;
    ID_SUCURSAL?:          string;
    NUMERO_DE_PEDIDO?:     number;
    PRODUCT0?:             string;
    CODIGO_UNIDAD_VENTA?:  string;
    CANTIDAD_PEDIDA?:      number;
    PRECIO_UNIDAD_VENTA?:  number;
    PRECIO_AFECTADO?:      number;
    MONTO_DESCUENTO_PDET?: number;
    MONTO_IVA?:            number;
    SUBTOTAL_VENTAS?:      number;
    CORRELATIVO_INGRESO?:  number;
    DESCRIPCION_PROD_AUX?: string;
}
