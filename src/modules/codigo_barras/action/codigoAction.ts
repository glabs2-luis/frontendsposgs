import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { Codigo } from "../interfaces/codigoInterface";
import { CodigoProducto } from "../interfaces/codigo2Interface";

export const obtenerCodigoBarrasAction = async (codigo: string, cantidad: number): Promise<Codigo> => {
  try {
    const { data } = await posApi.get<Codigo>(`/codigo-barra/${codigo}/${cantidad}`)
    return data
  } catch (error) {
    const message = getAxiosErrorMessage("error", "El Producto no existe")
    throw new Error(message)
  }
};

export const obtenerProductoPorCodigoAction = async (codigo: string) : Promise<CodigoProducto> =>{
  try{
    const { data } = await posApi.get<CodigoProducto>(`/codigo-barra/${codigo}`)
    return data
  } catch(error){
    const message = getAxiosErrorMessage('Hubo un error obteniendo el producto por codigo', error)
    throw new Error(message)
  }
}
