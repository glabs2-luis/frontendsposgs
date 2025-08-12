import posApi from '@/api/apiPos'
import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import posApiCertificador from '@/api/apiPosCertificacion'

// Obtener Datos Sat
export const validationAction = async (nit: string, tipo: string, validar: boolean, empresa: string ) : Promise<any> => {
    try {
        const { data } = await posApi.get<string>(`/validation`,  {params: {nit, tipo, validar, empresa}})
        console.log('Validation data desde Action: ', data)
        return data
    } catch ( error ) {
        const message = getAxiosErrorMessage(error, 'Hubo un error Validando')
        console.log(message)
        throw new Error(message)
    }

}