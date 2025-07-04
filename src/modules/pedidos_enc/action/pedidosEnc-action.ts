import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { PedidosEnc } from "../interfaces/pedidoEncInterface";

//  Crear pedido
export const crearPedidoEncAction = async (pedido: Partial<PedidosEnc>): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.post<PedidosEnc>(`/pedidos-enc/crear`, pedido);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error al crear el pedido");
    throw new Error(message);
  }
}

//  pedidos pendientes
export const obtenerPedidosPendientesAction = async (ID_SUCURSAL: number, CODIGO_VENDEDOR: number): Promise<PedidosEnc[]> => {
  try {
    const { data } = await posApi.get<PedidosEnc[]>(`/pedidos-enc/pendientes`, {
      params: { ID_SUCURSAL, CODIGO_VENDEDOR }
    });
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error al obtener pedidos pendientes");
    throw new Error(message);
  }
}

//  Obtener pedido por ID
export const obtenerPedidoEncPorIdAction = async (id: number): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.get<PedidosEnc>(`/pedidos-enc/${id}`);
    return data;

  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error al obtener el pedido");
    throw new Error(message);
  }
}

//  Eliminar pedido
export const eliminarPedidoEncAction = async (ID_PEDIDO_ENC: number): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.delete<PedidosEnc>(`/pedidos-enc/eliminar/${ID_PEDIDO_ENC}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error al eliminar el pedido");
    throw new Error(message);
  }
}

export const obtenerPedidoEncPorIdAction2 = async (id: number) : Promise<PedidosEnc>=> {
  try {
  const { data } = await posApi.get<PedidosEnc>(`/pedidos_enc/${id}`);
  return data;
    } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error al obtener ID 2 del pedido En");
    throw new Error(message);
  }
};
