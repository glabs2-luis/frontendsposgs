import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { FacturaEnc } from "../interfaces/facturaEncInterface";
import { FacturaEnc2 } from "../interfaces/facturaEnc2Interface";
import { DatosFel } from "../interfaces/datosFelInterface";
import { FacturaEnc3 } from "../interfaces/facturaEnc3Interface";
import { Detalle, Enc } from '../interfaces/detalleInterface';

// Obtener todas las Facturas enc
export const obtenerFacturasEncAction = async (): Promise<FacturaEnc[]> => {
  try {
    const { data } = await posApi.get<FacturaEnc[]>(`/facturas-enc`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener las facturas enc"
    );
    throw new Error(message);
  }
};

// Obtener factura Enc por id
export const obtenerFacturasEncIdAction = async (id: number): Promise<FacturaEnc> => {
  try {
    const { data } = await posApi.get<FacturaEnc>(`/facturas-enc/${id}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo facturas enc por Id"
    );
    throw new Error(error)
  }
};

//obtener det por factura enc id
export const obtenerDetalleFacturaPorIdAction = async (idFacturaEnc: number) => {
  try {
    const { data } = await posApi.get(`/facturas-enc/detalles/${idFacturaEnc}`);
    return data.ENC.DET;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo los detalles de la factura"
    );
    throw new Error(message); 
  }
};

// Para impresion xd
export const obtenerDetalleFacturaPorIdAction3 = async (idFacturaEnc: number) :Promise<Detalle> => {
  try {
    const { data } = await posApi.get(`/facturas-enc/detalles/${idFacturaEnc}`);
    return data.ENC.DES;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo los detalles de la factura"
    );
    throw new Error(message);
  }
};


// Por alguna razon esta xd
export const crearFacturaEncAction = async () => {
  try {
    const { data } = await posApi.post<FacturaEnc[]>(
      `/facturas-enc/facturacion`
    );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error creando la factura Enc"
    );
    throw new Error(message)
  }
};

// crear factura
export const crearFacturaEncAction2 = async (
  factura: FacturaEnc2
): Promise<FacturaEnc2> => {
  try {
    const { data } = await posApi.post<FacturaEnc2>(
      `/facturas-enc/facturacion`,
      factura
    );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error creando la factura Enc"
    );
    throw new Error(message);
  }
};

// oobtener Datos Fel
export const obtenerDatosFelAction = async (
  numero: number
): Promise<DatosFel> => {
  try {
    const { data } = await posApi.get(`/facturas-enc/fel-datos/${numero}`);
    return data;
  } catch (error) {
    const message = await getAxiosErrorMessage(
      error,
      " Hubo un error obteniendo los Datos Fel"
    );
    throw new Error(message);
  }
};

// obtener Facturas por fecha
export const obtenerFacturasFechaAction = async (
  fecha_inicial: Date,
  fecha_final: Date,
  serie: string
): Promise<FacturaEnc> => {
  try {
    const { data } = await posApi.get(`/facturas-enc/by-fecha`, {
      params: { fecha_inicial, fecha_final, serie },
    });
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error obteniendo facturas por fecha" );
    throw new Error(message);
  }
};

export const obtenerFacturaNumeroSerieAction = async (serie: string, numero: number) : Promise<FacturaEnc3> => {
  try {
    const { data } = await posApi.get(`/facturas-enc/factura2/${serie}/${numero}`);
    return data
    } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error obteniendo facturas por numero y serie"
    );
    throw new Error(message);
  }
}

  export const actualizarContingenciaAction = async (id: number): Promise<FacturaEnc> => {
    try {
      const { data } = await posApi.patch(`/facturas-enc/contingencia`, {ID_FACTURA_ENC: id, CONTINGENCIA: true})
      return data
    } catch (error) {
      const message = getAxiosErrorMessage(error, "Hubo un error actualizando la contingencia")
      throw new Error(message)
    }   

}

export const actualizarNitAction = async (id: number, nit: string, nombre:string): Promise<FacturaEnc> => {
  try {
    const { data } = await posApi.patch(`/facturas-enc/actualizarNit`, {ID_FACTURA_ENC: id, NIT_CLIEN_A_FACTURAR: nit, NOMBRE_CLI_A_FACTUAR: nombre})
    return data
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error actualizando el NIT")
    throw new Error(message)
  }
}