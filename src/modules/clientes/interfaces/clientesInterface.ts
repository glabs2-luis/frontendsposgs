export interface Cliente {
  ID_ACLIENTE:        number;
  NIT:                string;
  DPI:                string;
  NOMBRE:             string;
  DIRECCION:          string;
  TELEFONO:           string;
  CORREO_ELECTRONICO: string;
  FECHA_CUMPLE:       Date;        
  DEPARTAMENTO:       string;
  MUNICIPIO:          string;
  ZONA:               string;
  USUARIO_INGRESO:    string;
  SUSCRITO:           boolean;
  VENDEDOR_SUSCRIBE:  string;
  FECHA_SUSCRIPCION:  Date;    
  FECHA_CREACION:     Date;    
  ACTION?:              string;
}

