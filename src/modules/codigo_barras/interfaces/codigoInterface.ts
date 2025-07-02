export interface Codigo {
    producto?: ProductoCodigo;
    precio?:   Precio;
}

export interface Precio {
    PRECIO_FINAL?: number;
    MENSAJE?:      string;
}

export interface ProductoCodigo {
    ID_PRODUCTOS_ALTERNOS?: number;
    PRODUCT0?:              string;
    CODIGO_BARRA?:          string;
    FECHA_SYNC?:            string | null;
}
