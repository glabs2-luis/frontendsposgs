import { obtenerDatosEmpresaAction } from '../actions/felDatosEmpresaAction';
import { obtenerDatosEstablecimientoAction } from '../actions/felDatosEmpresaAction'
import { useQuery, useQueryClient } from '@tanstack/vue-query'

export const useDatosFel = () =>{

  const obtenerDatosEmpresa = async (id:number) => {
    return await obtenerDatosEmpresaAction(id)
  }

    const obtenerDatosEstablecimiento = async (id:number) => {
    return await obtenerDatosEstablecimientoAction(id)
  }

    return {
      obtenerDatosEmpresa,
      obtenerDatosEstablecimiento
    }

}