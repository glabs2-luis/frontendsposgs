import { Establecimiento } from '../interfaces/establecimientoInterfaces'
import { Empresa } from '../interfaces/empresaInterface'
import apiPos from '@/api/apiPos'
import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import posApi from '@/api/apiPos'

// obtener fel-empresa
export const obtenerDatosEmpresaAction = async (id: number) : Promise<Empresa> => {
    try{
        const { data } = await posApi.get<Empresa>(`/fel-empresa/${id}`)
        console.log('data de empresa desde action', data)
        return data
    }catch(error){
        const message = await getAxiosErrorMessage(error, 'Hubo un error obteniendo los datos de la empresa')
        console.log(message)
    }
}

// obtener fel-establecimiento
export const obtenerDatosEstablecimientoAction = async (id: number) : Promise<Establecimiento> => {
    try{
        const { data } = await posApi.get<Establecimiento>(`/fel-establecimiento/${id}`)
        console.log('data de establecimiento desde action', data)
        return data
    }catch(error){
        const message = await getAxiosErrorMessage(error, 'Hubo un error obteniendo los datos del establecimiento')
        console.log(message)
    }
}


