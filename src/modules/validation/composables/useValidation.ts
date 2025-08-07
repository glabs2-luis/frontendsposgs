import { validationAction } from '../action/validationAction';
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export const useValidation = async (nit: string, tipo: string, validar: boolean, empresa: string) => {

    const queryClient = useQueryClient()
  
  const { data: obtenerDatosSat, isLoading, error } = useQuery({
    queryKey: ['Datos-Sat', nit, tipo, validar, empresa], 
    queryFn: () => validationAction(nit, tipo, validar, empresa), 
    enabled: !nit
  })


    return {
        obtenerDatosSat
    }

}