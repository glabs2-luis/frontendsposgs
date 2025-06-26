import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { PedidosDet } from "../interfaces/pedidosDetInterface";

export const crearPedidoDetAction = async (detalle: PedidosDet): Promise<PedidosDet> => {
  try {
    const { data } = await posApi.post<PedidosDet>('/pedidos-det', detalle)
    return data
  } catch (error) {
    const message = getAxiosErrorMessage(error, "Hubo un error al crear el detalle del pedido")
    throw new Error(message)
  }
}

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

export const actualizarDescripcionPedidoDetAction = async (id: number, descripcion: string) : Promise<PedidosDet[]> => {
    try {
        const { data } = await posApi.patch<PedidosDet[]>(`/pedidos-det/${id}`,{ DESCRIPTION: descripcion })
        return data
    } catch (error){
        console.log(error, 'error')
        const message = getAxiosErrorMessage(error, 'Hubo un error actualizando la descripcion de Pedido Detalle por Id')
        throw new Error(message)
    }
}


