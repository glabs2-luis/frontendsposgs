import posApi from '@/api/apiPos'
import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import { Cupon, respuestaCupon } from '../interfaces/cuponesInterface'

// Aplicar cupon
export const AplicarDescuentoAction = async ( params: Cupon) : Promise<respuestaCupon> => {
    try {
        const { data } = await posApi.post<respuestaCupon>(`/cupones/aplicar-cupon`, params)
        return data
    }  catch ( error ) {
        const message = getAxiosErrorMessage(error, 'Hubo un error aplicando el cupon')
        console.log(message)
        throw new Error(message)
    }
}

