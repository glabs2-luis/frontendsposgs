import webApi from "@/api/apiWeb";
import webApiNoAuth from "@/api/apiWebNoAuth";
import { getAxiosErrorMessage } from "@/helper/geterrordb";
import axios from "axios";
// Obtiene listado general de productos
export const obtenerProductoExistencia = async (params) => {
  try {
    const { data } = await webApi.get(`/PRODUCTOS`, {params} )
    //console.log("Productos:", data)
    return data
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Error obteniendo la existencia del producto")
    //console.error("Error obteniendo la existencia del producto:", error)
    //console.error("Parámetros enviados:",  params)
    throw new Error(error)
   }
}

//Obtiene los lotes de un producto
export const obtenerLoteProducto = async (params) => {
    try {
        const { data } = await webApi.get(`/PRODUCTOS/ProductoLote`, {params})
         console.log("Parámetros enviados lote:", params)
        console.log("Lotes del producto desde action:", data)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Error obteniendo los lotes del producto")
        console.error("Error obteniendo los lotes del producto:", error)
        throw new Error(message)
    }
}

// Obtiene la existenia en otra bodegas
export const obtenerExistenciaBodega = async (params) => {
    try {
        const { data } = await webApi.get(`PRODUCTOS/EXISTENCIA`, {params})
         console.log("Parámetros enviados eixstencia:", params)
        console.log("Existencia en otras bodegas desde action:", data)
        return data
    } catch (error) {      
        const message = getAxiosErrorMessage(error, "Error obteniendo la existencia en otras bodegas")
        console.error("Error obteniendo la existencia en otras bodegas:", error)
        throw new Error(message)
    }
}

// Se escribe la ruta debido al conflicto con el token con la app local 
//Action para actualizar el token de existencia
export const obtenerTokenAction = async (params) => {
  try {
    //console.log("🔍 Params enviados:", params);
    console.log("webApiNoauh URL:", webApiNoAuth.defaults.baseURL);
    
    const response = await axios({
      method: 'POST',
      url: 'http://186.189.218.179:3000/API/VENDEDORES/LOGIN',
      //url: `${webApiNoAuth}/VENDEDORES/LOGIN`,
      params: {
        empresa: params.empresa,
        bodega: params.bodega,
        vendedor: params.vendedor,
        sucursal: params.sucursal
      },
      data: '201010',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      },
    });

    //console.log("Token obtenido:", response.data);
    return response.data;

  } catch (error) {
    //console.error("Error:", error.response?.status, error.response?.data);
    throw error;
  }
};

