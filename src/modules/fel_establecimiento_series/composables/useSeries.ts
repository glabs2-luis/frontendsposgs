import { FelSeries } from '../interfaces/felSeriesInterface'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import { showErrorNotification, showSuccessNotification, showConfirmationDialog } from '@/common/helper/notification'
import { obtenerSeriesAction, crearSeriesAction, obtenerSeriesPorSucursalAction } from '../actions/felSeriesAction'

export const useSeries = () => {

    const queryClient = useQueryClient()

    const { data: obtenerSeries, refetch: refetchSeries } = useQuery ({
        queryKey: ['series'],
        queryFn: () => obtenerSeriesAction()
    })

    // Obtener serie por la sucursal
    const obtenerSeriesSucursal = async (id: number)=> {
        return await queryClient.fetchQuery({
            queryKey: ['series-sucursal', id],
            queryFn: () => obtenerSeriesPorSucursalAction(id)
        })
    }

    // Funcional xd
    const seriesSucursal =  (id: number) => {
     return useQuery({
    queryKey: ['series-sucursal', id],
    queryFn: () => obtenerSeriesPorSucursalAction(id),
  })
}

    return {
        obtenerSeries, refetchSeries, obtenerSeriesSucursal, seriesSucursal
    }

}

export default useSeries