import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { obtenerFacturasErroresAction } from '../actions/facturasPendientesAction'

export const useFacturasFel = () => {

    const queryClient = useQueryClient()

    const { data: facturasErrores } =  useQuery({
        queryKey: ['facturas-pendientes'],
        queryFn: () => obtenerFacturasErroresAction()
    })

    return {
        facturasErrores
    }
}
