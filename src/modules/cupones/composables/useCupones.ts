import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { AplicarDescuentoAction } from '../action/cuponesAction'
import { Cupon } from '../interfaces/cuponesInterface'

export const useCupones = () => {
    
     const queryClient = useQueryClient()

    const { mutate: mutateAplicarCupon } = useMutation ({
        mutationFn: (cupon: Cupon) => AplicarDescuentoAction(cupon),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cupones']})
        }
    })

    return {
        mutateAplicarCupon
    }

}