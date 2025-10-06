import posApi from '@/api/apiPos'
import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import { Cupon, respuestaCupon } from '../interfaces/cuponesInterface'
import { Bitacora } from '../interfaces/bitacoraInterface'

// Aplicar cupon
export const AplicarDescuentoAction = async ( params: Cupon) : Promise<respuestaCupon> => {
    try {
        const { data } = await posApi.post<respuestaCupon>(`/cupones/aplicar-cupon`, params)
        return data
    }  catch ( error ) {
        const message = getAxiosErrorMessage(error, 'Hubo un error aplicando el cupon')
        throw new Error(message)
    }
}

export const obtenerCupones = async (fechaInicio: Date, fechaFinal: Date ) : Promise<Bitacora> => {
    try {
        const fechaInicioStr = fechaInicio.toISOString().split('T')[0]
        const fechaFinalStr = fechaFinal.toISOString().split('T')[0]
        const { data } = await posApi.get<Bitacora>(`/cupones/fecha`, {params: {fecha_inicio: fechaInicioStr, fecha_fin: fechaFinalStr}})
        return data
    } catch ( error ) {
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo los cupones')
        throw new Error(message)
    }

}