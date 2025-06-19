export interface PedidoEnc {
  ID_PEDIDO_ENC:        number;
  ID_SUCURSAL:          string;
  NUMERO_DE_PEDIDO:     number;
  FECHA_PEDIDO:         Date;
  USUARIO_INGRESO_PEDI: string;
  SUBTOTAL_PEDIDO:      null;
  MONTO_DESCUENTO_PEDI: number;
  IVA_PEDIDO:           null;
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
  TIPO_ESPECIAL:        string;
}
