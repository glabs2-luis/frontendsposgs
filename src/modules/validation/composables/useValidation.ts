import { validationAction } from '../action/validationAction'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export const useValidation = async () => {

    const queryClient = useQueryClient()

    const obtenerDatosSat = async(nit:string, tipo: string, validar:boolean, empresa:string) => {
        return useQuery({
    queryKey: ['validation', nit, tipo, empresa, validar],
    queryFn: () => validationAction(nit, tipo, validar, empresa),
    // Deshabilitar
    enabled: Boolean(nit && tipo && empresa),
    retry: false,
    })

    } 

    return {
        obtenerDatosSat
    }

}