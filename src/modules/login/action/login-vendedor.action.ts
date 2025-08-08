import posApi from "@/api/apiPos";
import { Login } from "../interfaces/login.interface";
import { getAxiosErrorMessage } from "@/helper/geterrordb";

export const loginVendedorAction = async (
  login: Partial<Login>
): Promise<Login> => {
  delete login.CODIGO_VENDEDOR;
  delete login.ESTADO_VENDEDOR;
  delete login.TIPO_VENDEDOR;
  try {
    const { data } = await posApi.post<Login>(`/vendedor/login`, {
      USUARIO: login.USUARIO,
      PASSWORD: login.PASSWORD,
    });
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Error al iniciar sesión");
    throw new Error(message);
  }
};
