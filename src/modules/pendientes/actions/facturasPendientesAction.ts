import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { ErrorFacturas } from "../interfaces/facturasPendientesInterface";

export const obtenerFacturasErroresAction = async (): Promise<
  ErrorFacturas[]
> => {
  try {
    const { data } = await posApi.get<ErrorFacturas[]>(`/fel-pendientes`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo la facturas fel con error"
    );
    throw new Error(message);
  }
};
