import { Sucursal } from "../interfaces/sucursalesInterface";
import { obtenerSucursalAction, eliminarScucursalAction, obtenerSucursalIdAction } from "../action/sucursalesAction";
import { useQuery } from "@tanstack/vue-query";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showSuccessNotification, showConfirmationDialog, showErrorNotification } from "@/common/helper/notification";

export const useSucursales = () => {

    const queryClient = useQueryClient()

    // obtener todos los clientes
    const { data: todasSucursales, refetch: refetchTodasSucursales } = useQuery({
        queryKey: ['sucursales'],
        queryFn: () => obtenerSucursalAction()
    }) 

    // Obtener sucursal por ID
    const obtenerSucursalID = async(id: number) => {
        try {
            const suc = await obtenerSucursalIdAction(id)

            if(suc){
                return suc
            } else {
                console.log('No se encontro la sucursal')
                return null
            }
        } catch (error){
            console.error('Error buscando cliente: ', error)
            return null
        }


    }

    // Eliminar sucursal
    const { mutate: mutateEliminarSucursal } = useMutation({
        mutationFn: eliminarScucursalAction
    })


    return {
        todasSucursales,
        refetchTodasSucursales,
        mutateEliminarSucursal,
        obtenerSucursalID
    }


}