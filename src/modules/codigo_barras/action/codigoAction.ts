import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { Codigo } from "../interfaces/codigoInterface";

export const obtenerCodigoBarrasAction = async (
  codigo: string,
  cantidad: number
): Promise<Codigo> => {
  try {
    const { data } = await posApi.get<Codigo>(
      `/codigo-barra/${codigo}/${cantidad}`
    );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage("error", "El Producto no existe");
    throw new Error(message);
  }
};
