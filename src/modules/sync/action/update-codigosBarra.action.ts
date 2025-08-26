import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const updateCodigosBarraAction = async (): Promise<void> => {
  try {
    const { data } = await posApi.post(`/sync/update-codigos-barra`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al momento de sincronizar los codigos de barra al sistema local de ventas"
    );
    throw new Error(message);
  }
};
