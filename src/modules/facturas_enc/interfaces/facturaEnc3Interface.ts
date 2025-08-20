export interface FacturaEnc3 {
    ID_FACTURA_ENC?:        number;
    ID_SUCURSAL?:           string;
    SERIE?:                 string;
    NUMERO_FACTURA?:        number;
    FECHA_DE_FACTURA?:      Date;
    USUARIO_QUE_FACTURA?:   string;
    MONTO_DESCUENTO_FACT?:  number;
    IVA_FACTURA?:           number;
    TOTAL_GENERAL?:         number;
    NOMBRE_CLI_A_FACTUAR?:  string;
    NIT_CLIEN_A_FACTURAR?:  string;
    DIRECCION_CLI_FACTUR?:  string;
    ESTADO_DE_FACTURA?:     string;
    CODIGO_DE_CLIENTE?:     number;
    CODIGO_VENDEDOR?:       number;
    NUMERO_DE_PEDIDO?:      number;
    PORC_DESCUENTO_GLOB?:   null;
    FECHA_ANULACION?:       null;
    USUARIO_ANULACION?:     null;
    MOTIVO_ANULACION?:      null;
    CORRELATIVO?:           null;
    TIPO_CONTRIBUYENTE?:    null;
    CORR_CONTINGENCIA?:     null;
    ESTADO_CERTIFICACION?:  null;
    CORR_CONTINGENCIA_INT?: null;
    pedido?:                Pedido;
}

export interface Pedido {
    ID_PEDIDO_ENC?:        number;
    ID_SUCURSAL?:          string;
    NUMERO_DE_PEDIDO?:     number;
    FECHA_PEDIDO?:         Date;
    USUARIO_INGRESO_PEDI?: string;
    SUBTOTAL_PEDIDO?:      number;
    MONTO_DESCUENTO_PEDI?: number;
    IVA_PEDIDO?:           number;
    TOTAL_GENERAL_PEDIDO?: number;
    ESTADO_PEDIDO?:        string;
    NOMBRE_A_FACTURAR?:    string;
    NIT_A_FACTURAR?:       string;
    DIRECCION_FACTURAR?:   string;
    OBSERVACIONES?:        null;
    CODIGO_DE_CLIENTE?:    number;
    CODIGO_VENDEDOR?:      number;
    PORC_DESCUENTO_GLOB?:  null;
    CODIGO_DE_BODEGA?:     null;
    TIPO_ESPECIAL?:        null;
}
