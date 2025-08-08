import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const updateCuponesDetAction = async (): Promise<void> => {
  try {
    const { data } = await posApi.post(`/sync/update-cupones-det`);
    return data;
  } catch (error) {
    console.log(error);
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al momento de sincronizar los cupones de detalle al sistema local de ventas"
    );
    throw new Error(message);
  }
};
