import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { PedidosEnc } from "../interfaces/pedidoEncInterface";
import { PedidosDet } from "@/modules/pedidos_det/interfaces/pedidosDetInterface";
import { Vendedor } from "@/modules/notas_credito/interfaces/NotaCredito";

//  Crear pedido
export const crearPedidoEncAction = async (
  pedido: Partial<PedidosEnc>
): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.post<PedidosEnc>(
      `/pedidos-enc/crear`,
      pedido
    );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al crear el pedido"
    );
    throw new Error(message);
  }
};

//  pedidos pendientes
export const obtenerPedidosPendientesAction = async (
  ID_SUCURSAL: number,
  CODIGO_VENDEDOR: number
): Promise<PedidosEnc[]> => {
  try {
    const { data } = await posApi.get<PedidosEnc[]>(`/pedidos-enc/pendientes`, {
      params: { ID_SUCURSAL, CODIGO_VENDEDOR },
    });
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener pedidos pendientes"
    );
    throw new Error(message);
  }
};

// anular pedido pendiente
export const AnularPedidosPendientesAction = async (
  id: number,
  usuario: string
): Promise<PedidosEnc> => {
  //console.log("usuario", usuario);
  try {
    const { data } = await posApi.post<PedidosEnc>(
      `/pedidos-enc/anular/${id}`,
      { USUARIO: usuario }
    );

    return data;
  } catch (error) {
    //console.error("Error al anular el pedido:", error);
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al anular el pedido"
    );
    throw new Error(message);
  }
};

//  Obtener pedido por ID
export const obtenerPedidoEncPorIdAction = async (
  id: number
): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.get<PedidosEnc>(`/pedidos-enc/${id}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener el pedido"
    );
    throw new Error(message);
  }
};

//  Eliminar pedido
export const eliminarPedidoEncAction = async (
  ID_PEDIDO_ENC: number
): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.delete<PedidosEnc>(
      `/pedidos-enc/eliminar/${ID_PEDIDO_ENC}`
    );
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al eliminar el pedido"
    );
    throw new Error(message);
  }
};

export const obtenerPedidoEncPorIdAction2 = async (
  id: number
): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.get<PedidosEnc>(`/pedidos_enc/${id}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener ID 2 del pedido En"
    );
    throw new Error(message);
  }
};

// Obtener detalle de pedido
export const obtenerDetallePedido = async (idPedidoEnc: number): Promise<PedidosDet[]> => {
  try {
    const { data } = await posApi.get(`pedidos-det/pedidoEncDetalle/${idPedidoEnc}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener detalle del pedido."
    );
    throw new Error(message);
  }
}

// Obtener pedidoEnc por numero
export const obtenerPedidoEncPorNumero = async (numeroPedido: number): Promise<PedidosEnc> => {
  try {
    const { data } = await posApi.get(`pedidos-enc/numeroPedido/${numeroPedido}`);
    return data;
  } catch (error) {
    const message = getAxiosErrorMessage(
      error,
      "Hubo un error al obtener pedido enc."
    );
    throw new Error(message);
  }
}