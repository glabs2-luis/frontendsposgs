import type { Vendedor, ApiFacturaResponse, DevolucionEnc, DevolucionDet, ApiNotaCreditoResponse, ProductoAlterno } from '@/modules/notas_credito/interfaces/NotaCredito';
import axios from 'axios';

const baseUrl = 'http://localhost:3001/api';

// Buscar una factura
export async function buscarFactura(serie: string, numero: number): Promise<ApiFacturaResponse | null> {
  try {
    const response = await axios.get(`${baseUrl}/facturas-enc/factura/${serie}/${numero}`);

    if (!response) throw new Error('Factura no encontrada');

    return response.data
  } catch (error) {
    console.log(error.response.data.message);
    return null;
  }
}

// Obtener tipo de vendedor
export const obtenerTipoVendedor = async (clave: string): Promise<Vendedor | null> => {
  try {
    const response = await axios.get(`${baseUrl}/vendedor/tipoVendedor/${clave}`);
    if (response.status !== 200) throw new Error('Vendedor no encontrado.');
    return response.data;
  } catch (error) {
    console.error("Error al obtener el tipo de vendedor:", error);
    return null;
  }
}

// Crear DevolucionEnc
export const crearDevolucionEnc = async (paylod: DevolucionEnc): Promise<DevolucionEnc> => {
  try {
    const response = await axios.post(`${baseUrl}/devoluciones-enc`, paylod);

    if (!response) throw new Error('No fue posible crear la devolucion enc.')

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage = errorData.message || 'Error desconocido del servidor.';

      if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        errorMessage = errorData.details[0];
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }

      throw new Error(errorMessage);

    } else if (error.request) {
      throw new Error('No se recibió respuesta del servidor. Verifique su conexión a internet.');
    } else {
      throw new Error('Error al crear devolucion enc: ' + error.message);
    }
  }
}

// Crear DevolucionDet
export const crearDevolucionDet = async (paylod: DevolucionDet): Promise<DevolucionDet> => {
  try {
    const response = await axios.post(`${baseUrl}/devoluciones-det`, paylod)

    if (!response) throw new Error("No fue posible crear la devolucion det.")

    return response.data;
  } catch (error) {
    console.error("Error al crear la devolucion det: ", error)
    return null
  }
}

// Obtener listado de devoluciones
export const obtenerDevolucionesEnc = async (): Promise<DevolucionEnc[]> => {
  try {
    const response = await axios.get(`${baseUrl}/devoluciones-enc`)

    return response.data;
  } catch (error) {
    console.error('Error al obtener devoluciones: ', error)
  }
}

export const obtenerDevoluciones = async () => {
  try {
    const response = await axios.get(`${baseUrl}/devoluciones-enc/devoluciones`)

    return response.data;
  } catch (error) {
    console.error('Error al obtener listado de devoluciones: ', error);
  }
}

// Obtener devolucion enc por numero de devolucion
export const obtenerDevolucionesEncPorNumero = async (numeroDevolucion: number): Promise<DevolucionEnc> => {
  try {
    const response = await axios.get(`${baseUrl}/devoluciones-enc/${numeroDevolucion}`);

    return response.data;
  } catch (error) {
    console.log('Error al obtener devolucion enc: ', error);
  }
}

// Obtener devoluciones det por numero de devolucion
export const obtenerDevolucionesEncDetalle = async (numeroDevolucion: number): Promise<ApiNotaCreditoResponse> => {
  try {
    const response = await axios.get(`${baseUrl}/devoluciones-enc/detalle/${numeroDevolucion}`)

    return response.data;
  } catch (error) {
    console.log("Error al obtener devoluciones det: ", error)
  }
}

// Obtener devoluciones det por numero de devolucion
export const obtenerDevolucionesDet = async (numeroDevolucion: number): Promise<DevolucionDet[]> => {
  try {
    const response = await axios.get(`${baseUrl}/devoluciones-det/detalle/${numeroDevolucion}`)

    return response.data;
  } catch (error) {
    console.log("Error al obtener devoluciones det: ", error)
  }
}

// Actualizar devolucion enc
export const actualizarDevolucionEnc = async (numeroDevolucion: number, paylod: Partial<DevolucionEnc>) => {
  try {
    const response = await axios.patch(`${baseUrl}/devoluciones-enc/${numeroDevolucion}`, {
      OBSERVACIONES: paylod.OBSERVACIONES
    })

    return response.data;
  } catch (error) {
    console.log("Error al actualizar devolucion enc: ", error);
  }
}

// Actualizar devolucion det
export const actualizarDevolucionDet = async (id: number, paylod: Partial<DevolucionDet>) => {
  try {
    const response = await axios.patch(`${baseUrl}/devoluciones-det/${id}`, {
      CANTIDAD_DEVUELTA: paylod.CANTIDAD_DEVUELTA,
      PRECIO_DEVOLUCION: paylod.PRECIO_DEVOLUCION
    });

    return response.data;
  } catch (error) {
    console.error('Error al actualizar el detalle:', error.response?.data || error.message);
    throw error;
  }
}

// Eliminar devolucion det
export const eliminarDevolucionDet = async (id: number) => {
  try {
    const response = await axios.delete(`${baseUrl}/devoluciones-det/eliminar/${id}`);

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage = errorData.message || 'Error desconocido del servidor.';

      if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        errorMessage = errorData.details[0];
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }

      throw new Error(errorMessage);

    } else if (error.request) {
      throw new Error('No se recibió respuesta del servidor. Verifique su conexión a internet.');
    } else {
      throw new Error('Error al eliminar el detalle:: ' + error.message);
    }
  }
}

// Eliminar devolucion enc
export const eliminarDevolucion = async (numeroDevolucion: number) => {
  try {
    const response = await axios.delete(`${baseUrl}/devoluciones-enc/eliminar/${numeroDevolucion}`)

    if (!response.data.ok) throw new Error("No fue posible eliminar la devolucion.")

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage = errorData.message || 'Error desconocido del servidor.';

      if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        errorMessage = errorData.details[0];
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }

      throw new Error(errorMessage);

    } else if (error.request) {
      throw new Error('No se recibió respuesta del servidor. Verifique su conexión a internet.');
    } else {
      throw new Error('Error al configurar la solicitud de eliminación: ' + error.message);
    }    
  }
}

// Obtener datos de vendedor
export const obtenerVendedor = async (codigoVendedor: number): Promise<Vendedor> => {
  try {
    const response = await axios.get(`${baseUrl}/vendedor/${codigoVendedor}`)
    return response.data;
  } catch (error) {
    console.error("Error al obtener vendedor: ", error);
    throw new Error("Error al obtener vendedor: " + error.message);
  }
}

// Obtener codigo de producto en base al codigo de barras
export const obtenerCodigoProducto = async (codigoBarras: string): Promise<ProductoAlterno | null> => {
  try {
    const response = await axios.get(`${baseUrl}/codigo-barra/${codigoBarras}`)

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response && (error.response.status === 404 || error.response.status === 500)) {
      console.warn(`Producto con código de barras ${codigoBarras} no encontrado.`);
      return null;
    }
    console.error("Error al obtener código de producto: ", error);
    throw new Error("Error al obtener código de producto: ", error.message);
  }
}
