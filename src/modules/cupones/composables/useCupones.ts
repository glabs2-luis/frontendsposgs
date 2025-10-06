import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { AplicarDescuentoAction } from '../action/cuponesAction'
import { Cupon } from '../interfaces/cuponesInterface'
import { obtenerCupones } from '../action/cuponesAction'
import { date } from 'quasar';

export const useCupones = () => {
    
     const queryClient = useQueryClient()

    const { mutate: mutateAplicarCupon } = useMutation ({
        mutationFn: (cupon: Cupon) => AplicarDescuentoAction(cupon),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cupones']})
        }
    })

    // Obtener cupones por fecha
    const todosCupones = async (fechaInicio: Date, fechaFinal: Date ) => {
        try {
            const cupones = await obtenerCupones(fechaInicio, fechaFinal)
            return cupones
        } catch (error) {   
            throw error
        }
    }

    return {
        todosCupones,
        mutateAplicarCupon
    }

}