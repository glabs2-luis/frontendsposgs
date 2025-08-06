export interface Certification {
    CertificadoFel?:   boolean;
    FechaAccion?:      Date;
    NumeroFacturaFel?: number;
    SerieFacturaFel?:  string;
    Uuid?:             string;
    MensajeFel?:       string;
}

export interface DtoCertificado {
    ID_SUCURSAL: number,
    SERIE: string,
    NUMERO_FACTURA: number,
    ESTADO_FACTURA: string,
    FECHA_ACCION: Date,
    NUMERO_FACTURA_FEL: string,
    SERIE_FACTURA_FEL: string,
    UUID: string,
    CERTIFICADO: string,
    ANULADO: string,
    CORRELATIVO: string,
    TIPO_DOCUMENTO: string,
    TIPO_CERTIFICADO?: string
}
