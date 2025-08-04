import { obtenerDatosEmpresaAction } from '../actions/felDatosEmpresaAction'
import { obtenerDatosEstablecimientoAction } from '../actions/felDatosEmpresaAction'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export const useDatosFel = () =>{

    const useEmpresa = (id) =>
      useQuery({
        queryKey: ['fel-empresa', id],
        queryFn: () => obtenerDatosEmpresaAction(id),
        enabled: !!id
      })
  
    const useEstablecimiento = (id) =>
      useQuery({
        queryKey: ['fel-establecimiento', id],
        queryFn: () => obtenerDatosEstablecimientoAction(id),
        enabled: !!id
      })
  
    return {
      useEmpresa,
      useEstablecimiento
    }

}