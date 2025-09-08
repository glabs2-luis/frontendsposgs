import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { PedidosDet } from "../interfaces/pedidosDetInterface";

// crear Pedido Det
export const crearPedidoDetAction = async (
  detalle: PedidosDet
): Promise<PedidosDet> => {
  try {
    const { data } = await posApi.post<PedidosDet>("/pedidos-det", detalle);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al crear el detalle del pedido"
    );
    throw new Error(message);
  }
};

// obtener pedido det por Id
export const obtenerPedidoDetIdAction = async (
  id: number
): Promise<PedidosDet[]> => {
  try {
    const { data } = await posApi.get<PedidosDet[]>(`pedidos-det/${id}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error obteniendo Pedido Detalle por Id"
    );
    throw new Error(message);
  }
};

// eliminar pedido det por Id
export const eliminarPedidoDetId = async (
  id: number
): Promise<PedidosDet[]> => {
  try {
    const { data } = await posApi.delete(`/pedidos-det/${id}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error eliminar Pedido Detalle por Id"
    );
    throw new Error(message);
  }
};

// Actualizar la descripcion en pedido det
export const actualizarDescripcionPedidoDetAction = async (
  id: number,
  descripcion: string
): Promise<PedidosDet> => {
  try {
    const desc = encodeURIComponent(descripcion.trim()); // Evitar errores con los caracteres
    const { data } = await posApi.patch<PedidosDet>(
      `/pedidos-det/cambiarDescripcion/${id}/${desc}`
    );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error actualizando la descripcion de Pedido Detalle por Id"
    );
    throw new Error(message);
  }
};

// Actualizar cantidad en pedido det
export const actualizarCantidadPedidoDetAction = async (
  id: number,
  cantidad: number
): Promise<void> => {
  try {
    await posApi.put(`/pedidos-det/updateCantidad`, {}, {
      params: { ID_PEDIDO_DET: id, CANTIDAD_NUEVA: cantidad },
    });
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error actualizando la cantidad de Pedido Detalle por Id"
    );
    throw new Error(message);
  }
};

// Actualizar precio en pedido det
export const actualizarPrecioPedidoDetAction = async (
  id: number,
  precio: number
): Promise<void> => {
  try {
    await posApi.put(`/pedidos-det/updatePrecio`, null, {
      params: { ID_PEDIDO_DET: id, PRECIO_NUEVO: precio },
    });
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error actualizando el precio de Pedido Detalle por Id"
    );
    throw new Error(message);
  }
};

// obtener lista de pedido det
export const obtenerListaPedidosDet = async (
  idPedidoEnc: number
): Promise<PedidosDet[]> => {
  try {
    const { data } = await posApi.get<PedidosDet[]>(
      `/pedidos-det/pedidoEncDetalle/${idPedidoEnc}`
    );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "hubo un error obteniendo la lista de pedidos det"
    );
    throw new Error(message);
  }
};
