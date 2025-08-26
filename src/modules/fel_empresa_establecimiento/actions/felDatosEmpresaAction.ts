import { Establecimiento } from '../interfaces/establecimientoInterfaces'
import { Empresa } from '../interfaces/empresaInterface'
import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import posApi from '@/api/apiPos'

// obtener fel-empresa
export const obtenerDatosEmpresaAction = async (id: number) : Promise<Empresa> => {
    try{
        const { data } = await posApi.get<Empresa>(`/fel-empresa/${id}`)
        return data
    }catch(error){
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo los datos de la empresa')
        throw new Error(message)
    }
}

// obtener fel-establecimiento
export const obtenerDatosEstablecimientoAction = async (id: number) : Promise<Establecimiento> => {
    try{
        const { data } = await posApi.get<Establecimiento>(`/fel-establecimiento/${id}`)
        return data
    }catch(error){
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo los datos del establecimiento')
        throw new Error(message)
    }
}


