export interface Detalle {
    ENC: Enc;
}

export interface Enc {
    ID_FACTURA_ENC:        number;
    ID_SUCURSAL:           string;
    SERIE:                 string;
    NUMERO_FACTURA:        number;
    FECHA_DE_FACTURA:      Date;
    USUARIO_QUE_FACTURA:   string;
    MONTO_DESCUENTO_FACT:  number;
    IVA_FACTURA:           number;
    TOTAL_GENERAL:         number;
    NOMBRE_CLI_A_FACTUAR:  string;
    NIT_CLIEN_A_FACTURAR:  string;
    DIRECCION_CLI_FACTUR:  string;
    ESTADO_DE_FACTURA:     string;
    CODIGO_DE_CLIENTE:     number;
    CODIGO_VENDEDOR:       number;
    NUMERO_DE_PEDIDO:      number;
    PORC_DESCUENTO_GLOB:   null;
    FECHA_ANULACION:       null;
    USUARIO_ANULACION:     null;
    MOTIVO_ANULACION:      null;
    CORRELATIVO:           null;
    TIPO_CONTRIBUYENTE:    null;
    CORR_CONTINGENCIA:     number;
    ESTADO_CERTIFICACION:  null;
    CORR_CONTINGENCIA_INT: null;
    pedido:                Pedido;
    DET:                   Det[];
    DES:                   De[];
    CUPONES:               any[];

}

export interface De {
    PRODUCT0:            string;
    CANTIDAD_PEDIDA:     number;
    DESCRIPCION_PROD:    string;
    PRECIO_UNIDAD_VENTA: number;
    SUBTOTAL_GENERAL:    number;
}

export interface Det {
    ID_FACTURA_DET:       number;
    ID_SUCURSAL:          string;
    SERIE:                string;
    NUMERO_FACTURA:       number;
    PRODUCT0:             string;
    CODIGO_UNIDAD_VTA:    string;
    CANTIDAD_VENDIDA:     number;
    CANTIDAD_DEVUELTA:    null;
    COSTO_UNITARIO_PROD:  number;
    PRECIO_UNITARIO_VTA:  number;
    MONTO_DESCUENTO_DET:  null;
    PRECIO_ORIGINAL:      number;
    MONTO_IVA:            number;
    SUBTOTAL_VENTAS:      number;
    SUBTOTAL_GENERAL:     number;
    MONTO_DESCUENTO_LINE: null;
    CORRELATIVO_INGRESO:  null;
    producto:             Producto;
}

export interface Producto {
    PRODUCT0:                 string;
    DESCRIPCION_PROD:         string;
    COSTO_UNITARIO:           number;
    ESTADO_PRODUCTO:          string;
    CODIGO_MARCA:             number;
    FAMILIA:                  null;
    SUBFAMILIA:               null;
    SUBSUBFAMILIA:            null;
    FECHA_SYNC_INSERT_UPDATE: Date;
}

export interface Pedido {
    ID_PEDIDO_ENC:        number;
    ID_SUCURSAL:          string;
    NUMERO_DE_PEDIDO:     number;
    FECHA_PEDIDO:         Date;
    USUARIO_INGRESO_PEDI: string;
    SUBTOTAL_PEDIDO:      number;
    MONTO_DESCUENTO_PEDI: number;
    IVA_PEDIDO:           number;
    TOTAL_GENERAL_PEDIDO: number;
    ESTADO_PEDIDO:        string;
    NOMBRE_A_FACTURAR:    string;
    NIT_A_FACTURAR:       string;
    DIRECCION_FACTURAR:   string;
    OBSERVACIONES:        null;
    CODIGO_DE_CLIENTE:    number;
    CODIGO_VENDEDOR:      number;
    PORC_DESCUENTO_GLOB:  null;
    CODIGO_DE_BODEGA:     null;
    TIPO_ESPECIAL:        null;
}
