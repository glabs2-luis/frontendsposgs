import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import posApi from "@/api/apiPos";

export const updateVendedoresAction = async (): Promise<void> => {
  try {
    const { data } = await posApi.post(`/sync/update-vendedores`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al momento de sincronizar los vendedores al sistema local de ventas"
    );
    throw new Error(message);
  }
};
