import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const updateProductosAction = async (): Promise<void> => {
  try {
    const { data } = await posApi.post(`/sync/update-productos`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al momento de sincronizar los productos al sistema local de ventas"
    );
    throw new Error(message);
  }
};
