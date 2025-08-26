import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const updatePreciosAction = async (): Promise<void> => {
  try {
    const { data } = await posApi.post(`/sync/update-precios`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al momento de sincronizar los precios al sistema local de ventas"
    );
    throw new Error(message);
  }
};
