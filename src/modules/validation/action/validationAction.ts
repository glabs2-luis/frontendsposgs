import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import posApiCertificador from "@/api/apiPosCertificacion";
import { Validation } from "../interfaces/validationInterface";

// Obtener Datos Sat
export const validationAction = async (
  nit: string,
  tipo: string,
  validar: boolean,
  empresa: string
): Promise<Validation> => {
  try {
    const { data } = await posApi.get<Validation>(`/validation`, {params: { nit, tipo, validar, empresa }, })
    return data
  } catch (error) {
    const err: any = error;
    const respError = err?.response?.data?.error;
    const personalizado = respError?.message_personalizado;
    const fallbackMsg = respError?.message || "Hubo un error Validando";
    const message =
      personalizado + " | " + fallbackMsg ||
      getAxiosErrorMessage(err, fallbackMsg);
    throw new Error(message);
  }
};
