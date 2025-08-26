import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const updateCuponesEncAction = async (): Promise<void> => {
  try {
    const { data } = await posApi.post(`/sync/update-cupones-enc`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al momento de sincronizar los cupones de encabezado al sistema local de ventas"
    );
    throw new Error(message);
  }
};
