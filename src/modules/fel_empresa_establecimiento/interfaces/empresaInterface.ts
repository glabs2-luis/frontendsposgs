export interface Empresa {
    ID_EMPRESA?:            number;
    NIT_EMISOR?:            string;
    NOMBRE_EMISOR?:         string;
    DIRECCION_EMISOR?:      string;
    NOMBRE_COMERCIAL?:      string;
    AFILIACION_IVA?:        string;
    PAIS?:                  string;
    DEPARTAMENTO?:          string;
    MUNICIPIO?:             string;
    EMAIL?:                 string;
    CODIGO_POSTAL_EMISOR?:  string;
    USUARIO_CERTIFICACION?: string;
    LLAVE_CERTIFICACION?:   string;
    ALIAS_FIRMA?:           string;
    LLAVE_FIRMA_TOKEN?:     string;
    TELEFONO?:              string;
    CONDICIONES_CREDITO1?:  string;
    CONDICIONES_CREDITO2?:  string;
    CONDICIONES_CREDITO3?:  string;
    CORRELATIVO?:           string;
    WHATSAPP?:              string;
    PAGINA?:                string;
    CORR_CONTINGENCIA?:     string;
    RETIENE_IVA?:           string;
    TOKEN_CUI?:             string;
}
