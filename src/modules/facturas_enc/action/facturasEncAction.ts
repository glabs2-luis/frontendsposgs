import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { FacturaEnc } from "../interfaces/facturaEncInterface";
import { FacturaEnc2 } from "../interfaces/facturaEnc2Interface";
import { DatosFel } from "../interfaces/datosFelInterface";

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
    console.log(message);
  }
};

// Obtener factura Enc por id
export const obtenerFacturasEncIdAction = async (
  id: number
): Promise<FacturaEnc> => {
  try {
    const { data } = await posApi.get<FacturaEnc>(`/facturas-enc/${id}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo facturas enc por Id"
    );
    //console.log(message)
    // throw new Error(error)
  }
};

//obtener det por factura enc id
export const obtenerDetalleFacturaPorIdAction = async (
  idFacturaEnc: number
) => {
  try {
    const { data } = await posApi.get(`/facturas-enc/detalles/${idFacturaEnc}`);
    return data.ENC.DET;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo los detalles de la factura"
    );
    // console.log(message);
  }
};

// Por alguna razon esta xd
export const crearFacturaEncAction = async () => {
  try {
    const { data } = await posApi.post<FacturaEnc[]>(
      `/facturas-enc/facturacion`
    );
    console.log("📤 Enviando a backend:", data);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error creando la factura Enc"
    );
    console.log(message);
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
    console.log(message);
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
    console.log(message);
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
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo facturas por fecha"
    );
    console.log(message);
    throw new Error(message);
  }
};
