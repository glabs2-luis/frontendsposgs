import webApi from "@/api/apiWeb";
import webApiNoAuth from "@/api/apiWebNoAuth";
import { getAxiosErrorMessage } from "@/helper/geterrordb";
import axios from "axios";

// Obtiene listado general de productos
export const obtenerProductoExistencia = async (params) => {
  try {
    const { data } = await webApi.get(`/PRODUCTOS`, {params} )
    return data
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Error obteniendo la existencia del producto")
    throw new Error(error)
   }
}

//Obtiene los lotes de un producto
export const obtenerLoteProducto = async (params) => {
    try {
        const { data } = await webApi.get(`/PRODUCTOS/ProductoLote`, {params})
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Error obteniendo los lotes del producto")
        throw new Error(message)
    }
}

// Obtiene la existencia en otra bodegas
export const obtenerExistenciaBodega = async (params) => {
    try {
        const { data } = await webApi.get(`PRODUCTOS/EXISTENCIA`, {params})
        return data
    } catch (error) {      
        const message = getAxiosErrorMessage(error, "Error obteniendo la existencia en otras bodegas")
        throw new Error(message)
    }
}

// Se escribe la ruta debido al conflicto con el token con la app local 
//Action para actualizar el token de existencia
export const obtenerTokenAction = async (params) => {
  try {
    //console.log("🔍 Params enviados:", params);
    //console.log("webApiNoauh URL:", webApiNoAuth.defaults.baseURL);
    
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

