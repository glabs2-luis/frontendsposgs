import webApi from "@/api/apiWeb";
import { getAxiosErrorMessage } from "@/helper/geterrordb";

export const obtenerProductoExistenciaCodigoAction = async (params) => {
  try {
    const { data } = await webApi.get(`/PRODUCTOS/ProductoLote`, {params} )    
    console.log("Productos por código:", data)
    return data
  }
  catch (error) {       
    const message = getAxiosErrorMessage(error, "Error obteniendo el producto por código")
    throw new Error(message)
  }   
}


