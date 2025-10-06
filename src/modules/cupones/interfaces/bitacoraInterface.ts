export interface Bitacora {
    resultado: Resultado[];
}

export interface Resultado {
    ID?:              number;
    NUMERO_CUPON?:    string;
    NUMERO_PEDIDO?:   string;
    SUCURSAL?:        string;
    VENDEDOR_APLICA?: number;
    ESTADO?:          string;
    FECHA?:           Date;
    PORC_APLICADO?:   number | null;
}


