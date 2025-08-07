import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { PedidosDet } from "../interfaces/pedidosDetInterface";

// crear Pedido Det
export const crearPedidoDetAction = async (detalle: PedidosDet): Promise<PedidosDet> => {
  try {
    const { data } = await posApi.post<PedidosDet>('/pedidos-det', detalle)
    return data
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error al crear el detalle del pedido")
    throw new Error(message)
  }
}

// obtener pedido det por Id
export const obtenerPedidoDetIdAction = async (id: number): Promise<PedidosDet[]> => {
    try {
        const { data } = await posApi.get<PedidosDet[]>(`pedidos-det/${id}`)
        return data
    } catch(error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error,"Hubo un error obteniendo Pedido Detalle por Id")
        throw new Error(message)
    }
}

// eliminar pedido det por Id
export const eliminarPedidoDetId = async (id: number) : Promise<PedidosDet[]> => {
    try {
        const { data } = await posApi.delete(`/pedidos-det/${id}`)
        return data
          } catch (error) {
        console.log(error, 'error')
        const message = getAxiosErrorMessage(error, "Hubo un error eliminar Pedido Detalle por Id")
        throw new Error(message)
    }
}

// Actualizar la descripcion en pedido det
export const actualizarDescripcionPedidoDetAction = async (id: number, descripcion: string) : Promise<PedidosDet> => {
    try {
        const { data } = await posApi.patch<PedidosDet>(`/pedidos-det/${id}`,{ DESCRIPCION_PROD_AUX: descripcion })
        return data
    } catch (error){
        console.log(error, 'error')
        const message = getAxiosErrorMessage(error, 'Hubo un error actualizando la descripcion de Pedido Detalle por Id')
        throw new Error(message)
    }
}

// obtener lista de pedido det
export const obtenerListaPedidosDet = async (idPedidoEnc:number) : Promise<PedidosDet[]> => {
    try {
      const { data } = await posApi.get<PedidosDet[]>(`/pedidos-det/pedidoEncDetalle/${idPedidoEnc}`)
      console.log('Devuelvo lista detalles', data)
      return data
    } catch(error){
      const message = getAxiosErrorMessage(error, "hubo un error obteniendo la lista de pedidos det")
      console.log(message)
    }
}

