export interface FacturaEnc {
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
    PORC_DESCUENTO_GLOB?:   number;
    FECHA_ANULACION?:       null;
    USUARIO_ANULACION?:     null;
    MOTIVO_ANULACION?:      null;
    CORRELATIVO?:           null;
    TIPO_CONTRIBUYENTE?:    null;
    CORR_CONTINGENCIA?:     null;
    ESTADO_CERTIFICACION?:  null;
    CORR_CONTINGENCIA_INT?: null;
}
