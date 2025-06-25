export interface PedidosEnc {
  ID_PEDIDO_ENC?:          number;
  ID_SUCURSAL:             number;
  NUMERO_DE_PEDIDO?:       number;
  FECHA_PEDIDO:            Date;
  USUARIO_INGRESO_PEDI?:   string;
  SUBTOTAL_PEDIDO?:        number;
  MONTO_DESCUENTO_PEDI?:   number;
  IVA_PEDIDO:              number;
  TOTAL_GENERAL_PEDIDO?:   number;
  ESTADO_PEDIDO?:          string;
  NOMBRE_A_FACTURAR?:      string;
  NIT_A_FACTURAR?:         string;
  DIRECCION_FACTURAR?:     string;
  OBSERVACIONES?:          string;
  CODIGO_DE_CLIENTE?:      number;
  CODIGO_VENDEDOR?:        number;
  PORC_DESCUENTO_GLOB?:    number;
  CODIGO_DE_BODEGA?:       number;
}

