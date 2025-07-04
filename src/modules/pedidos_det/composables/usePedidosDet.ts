import { PedidosDet } from '../interfaces/pedidosDetInterface';
import { useQuery } from "@tanstack/vue-query";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showConfirmationDialog } from "@/common/helper/notification";
import { crearPedidoDetAction, actualizarDescripcionPedidoDetAction, eliminarPedidoDetId, obtenerPedidoDetIdAction, obtenerListaPedidosDet } from "../action/pedidosDetAction";

export const usePedidoDet = () => {

    const queryClient = useQueryClient()

    // Crear Pedido detalle
    const { mutate: mutateCrearPedidoDet } = useMutation({
        mutationFn: (PedidosDet: Partial<PedidosDet>) => crearPedidoDetAction(PedidosDet),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['pedidos-det'] })
        }
    })

    // Obtener pedido Detalle por ID
    const obtenerPedidosDetID = async (id: number) => {
        try {
        const ped = await obtenerPedidoDetIdAction(id)
        return ped ?? null
        } catch (error) {
        console.error('Error buscando Pedido Detalle', error)
        return null
        }
    }

    // Actualizar descripcion detalle
    const { mutate: mutateActualizarPedidoDetId } = useMutation({
        mutationFn: (params: { id: number; descripcion: string }) =>
        actualizarDescripcionPedidoDetAction(params.id, params.descripcion),

        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pedidos-det'] })
        }
    })
    
    // eliminar pedido detalle Id
    const { mutate: mutateEliminarPedidoDetID } = useMutation({
        mutationFn: eliminarPedidoDetId,
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pedidos-det'] })
        }
    })

    // obtener lista pedidos det
        const ListaDet = (idPedidoEnc: number) => {
        return useQuery({
        queryKey: ['pedido-det', idPedidoEnc],
        queryFn: () => obtenerListaPedidosDet(idPedidoEnc),
        enabled: !!idPedidoEnc, 
        refetchOnWindowFocus: false,
    })
    }

    return {
        mutateCrearPedidoDet,
        obtenerPedidosDetID,
        mutateActualizarPedidoDetId,
        mutateEliminarPedidoDetID,
        ListaDet
    }

}