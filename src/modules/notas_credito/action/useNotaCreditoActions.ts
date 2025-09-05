import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/helper/geterrordb";
import type {
  Vendedor,
  ApiFacturaResponse,
  DevolucionEnc,
  DevolucionDet,
  ApiNotaCreditoResponse,
  ProductoAlterno,
} from "@/modules/notas_credito/interfaces/NotaCredito";
import axios from "axios";
import { c } from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

// const baseUrl = 'http://localhost:3001/api';

// Buscar una factura
export async function buscarFactura(
  serie: string,
  numero: number
): Promise<ApiFacturaResponse | null> {
  try {
    const response = await posApi.get(
      `/facturas-enc/factura/${serie}/${numero}`
    );
    if (!response) throw new Error("Factura no encontrada");
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error buscando la factura"
    );
    throw new Error(message);
  }
}

// Buscar una factura con nombre de producto en detalle
export async function buscarFacturaConDetalle(
  serie: string,
  numero: number
): Promise<ApiFacturaResponse | null> {
  try {
    const response = await posApi.get(
      `/facturas-enc/detallesProducto/${serie}/${numero}`
    );

    if (!response) throw new Error("Factura no encontrada");

    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error buscando la factura con detalle"
    );
    throw new Error(message);
  }
}

// Obtener tipo de vendedor
export const obtenerTipoVendedor = async (
  clave: string
): Promise<Vendedor | null> => {
  try {
    const response = await posApi.get(`/vendedor/tipoVendedor/${clave}`);
    if (response.status !== 200)
      throw new Error("Clave incorrecta, por favor revisa tu clave.");
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error buscando al vendedor"
    );
    throw new Error(message);
  }
};

// Crear DevolucionEnc
export const crearDevolucionEnc = async (
  paylod: DevolucionEnc
): Promise<DevolucionEnc> => {
  try {
    const response = await posApi.post(`/devoluciones-enc`, paylod);

    if (!response) throw new Error("No fue posible crear la devolucion enc.");

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage = errorData.message || "Error desconocido del servidor.";

      if (
        errorData.details &&
        Array.isArray(errorData.details) &&
        errorData.details.length > 0
      ) {
        errorMessage = errorData.details[0];
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }

      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        "No se recibió respuesta del servidor. Verifique su conexión a internet."
      );
    } else {
      throw new Error("Error al crear devolucion enc: " + error.message);
    }
  }
};

// Crear DevolucionDet
export const crearDevolucionDet = async (
  paylod: DevolucionDet
): Promise<DevolucionDet> => {
  try {
    const response = await posApi.post(`/devoluciones-det`, paylod);

    if (!response) throw new Error("No fue posible crear la devolucion det.");

    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error creando la devolucion det"
    );
    throw new Error(message);
  }
};

// Obtener listado de devoluciones
export const obtenerDevolucionesEnc = async (): Promise<DevolucionEnc[]> => {
  try {
    const response = await posApi.get(`/devoluciones-enc`);

    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo las devoluciones"
    );
    throw new Error(message);
  }
};

export const obtenerDevoluciones = async () => {
  try {
    const response = await posApi.get(`/devoluciones-enc/devoluciones`);
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo las devoluciones"
    );
    throw new Error(message);
  }
};

// Obtener devolucion enc por numero de devolucion
export const obtenerDevolucionesEncPorNumero = async (
  numeroDevolucion: number
): Promise<DevolucionEnc> => {
  try {
    const response = await posApi.get(`/devoluciones-enc/${numeroDevolucion}`);
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener la devolucion por numero"
    );
    throw new Error(message);
  }
};

// Obtener devoluciones det por numero de devolucion
export const obtenerDevolucionesEncDetalle = async (
  numeroDevolucion: number
): Promise<ApiNotaCreditoResponse> => {
  try {
    const response = await posApi.get(
      `/devoluciones-enc/detalle/${numeroDevolucion}`
    );
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener la devolucion por numero"
    );
    throw new Error(message);
  }
};

// Obtener devoluciones det por numero de devolucion
export const obtenerDevolucionesDet = async (
  numeroDevolucion: number
): Promise<DevolucionDet[]> => {
  try {
    const response = await posApi.get(
      `/devoluciones-det/detalle/${numeroDevolucion}`
    );
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener la devolucion por numero"
    );
    throw new Error(message);
  }
};

// Actualizar devolucion enc
export const actualizarDevolucionEnc = async (
  numeroDevolucion: number,
  paylod: Partial<DevolucionEnc>
) => {
  try {
    const response = await posApi.patch(
      `/devoluciones-enc/${numeroDevolucion}`,
      {
        OBSERVACIONES: paylod.OBSERVACIONES,
      }
    );
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al actualizar la devolucion enc"
    );
    throw new Error(message);
  }
};

// Actualizar devolucion det
export const actualizarDevolucionDet = async (
  id: number,
  paylod: Partial<DevolucionDet>
) => {
  try {
    const response = await posApi.patch(`/devoluciones-det/${id}`, {
      CANTIDAD_DEVUELTA: paylod.CANTIDAD_DEVUELTA,
      PRECIO_DEVOLUCION: paylod.PRECIO_DEVOLUCION,
    });
    return response.data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al actualizar la devolucion det"
    );
    throw new Error(message);
  }
};

// Eliminar devolucion det
export const eliminarDevolucionDet = async (id: number) => {
  try {
    const response = await posApi.delete(`/devoluciones-det/eliminar/${id}`);

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage = errorData.message || "Error desconocido del servidor.";

      if (
        errorData.details &&
        Array.isArray(errorData.details) &&
        errorData.details.length > 0
      ) {
        errorMessage = errorData.details[0];
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }

      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        "No se recibió respuesta del servidor. Verifique su conexión a internet."
      );
    } else {
      throw new Error("Error al eliminar el detalle:: " + error.message);
    }
  }
};

// Eliminar devolucion enc
export const eliminarDevolucion = async (numeroDevolucion: number) => {
  try {
    const response = await posApi.delete(
      `/devoluciones-enc/eliminar/${numeroDevolucion}`
    );

    if (!response.data.ok)
      throw new Error("No fue posible eliminar la devolucion.");

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage = errorData.message || "Error desconocido del servidor.";

      if (
        errorData.details &&
        Array.isArray(errorData.details) &&
        errorData.details.length > 0
      ) {
        errorMessage = errorData.details[0];
      } else if (errorData.details) {
        errorMessage = errorData.details;
      }

      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error(
        "No se recibió respuesta del servidor. Verifique su conexión a internet."
      );
    } else {
      throw new Error(
        "Error al configurar la solicitud de eliminación: " + error.message
      );
    }
  }
};

// Obtener datos de vendedor
export const obtenerVendedor = async (
  codigoVendedor: number
): Promise<Vendedor> => {
  try {
    const response = await posApi.get(`/vendedor/${codigoVendedor}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener vendedor: " + error.message);
  }
};

// Obtener codigo de producto en base al codigo de barras
export const obtenerCodigoProducto = async (
  codigoBarras: string
): Promise<ProductoAlterno | null> => {
  try {
    const response = await posApi.get(`/codigo-barra/${codigoBarras}`);

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      (error.response.status === 404 || error.response.status === 500)
    ) {
      //console.warn(`Producto con código de barras ${codigoBarras} no encontrado.`);
      return null;
    }
    throw new Error("Error al obtener código de producto: ", error.message);
  }
};
