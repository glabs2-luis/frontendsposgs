import { Sucursal } from "../interfaces/sucursalesInterface";
import { obtenerSucursalAction, eliminarScucursalAction, obtenerSucursalIdAction } from "../action/sucursalesAction";
import { useQuery } from "@tanstack/vue-query";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showSuccessNotification, showConfirmationDialog, showErrorNotification } from "@/common/helper/notification";

export const useSucursales = () => {

    const queryClient = useQueryClient()

    // obtener todos las sucursales
    const { data: todasSucursales, refetch: refetchTodasSucursales } = useQuery({
        queryKey: ['sucursales'],
        queryFn: () => obtenerSucursalAction()
    }) 

    const { data: obtenerSucursal, refetch: refetchObtenerSucursales } = useQuery ({
        queryKey: ['sucursales-id' ], 
        queryFn: () => obtenerSucursalIdAction('1')

    })

    // Eliminar sucursal
    const { mutate: mutateEliminarSucursal } = useMutation({
        mutationFn: eliminarScucursalAction
    })

    return {
        todasSucursales,
        refetchTodasSucursales,
        mutateEliminarSucursal,
        obtenerSucursal,
        refetchObtenerSucursales
    }


}