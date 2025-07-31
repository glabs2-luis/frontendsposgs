import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import { Certification } from '../interfaces/certificationInterface'
import posApi from '@/api/apiPos'

export const crearCertificationAction = async (  datos: { sucursal: string; serie: string; numero: number } ) : Promise<Certification> => {
    try {
        const { data } = await posApi.post(`/certification`, {idSucursal: datos.sucursal, serie: datos.serie, numeroFactura: datos.numero})
        console.log('retornando crear certificacion desde action: ', data)
        return data
    } catch (error){
        const message = await getAxiosErrorMessage(error, 'Hubo un error creando la certification')
        console.log(message)
    }
}
