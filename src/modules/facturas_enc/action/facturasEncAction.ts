import posApi from "@/api/apiPos"
import { getAxiosErrorMessage } from "@/common/helper/geterrordb"
import { FacturaEnc } from '../interfaces/facturaEncInterface';

// Obtener toas las Facturas enc
export const obtenerFacturasEncAction = async () : Promise<FacturaEnc[]> => {
    try {
        const { data } = await posApi.get<FacturaEnc[]>(`/facturas-enc`)
        return data
    } catch (error){
        const message = getAxiosErrorMessage(error, 'Hubo un error al obtener las facturas enc')
        throw new Error(message)
    }
}

// Obtener factura Enc por id
export const obtenerFacturasEncIdAction = async (id:number) : Promise<FacturaEnc> => {
    try {
        const { data } = await posApi.get<FacturaEnc>(`/facturas-enc/${id}`)
        return data    
    } catch (error){
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo facturas enc por Id')
        throw new Error(message)
    }
}

//obtener det por factura enc id
export const obtenerDetalleFacturaPorIdAction = async (idFacturaEnc:number) => {
    try {
        const { data } = await posApi.get(`/facturas-enc/detalles/${idFacturaEnc}`)
        return data.ENC.DET
     } catch(error){
            const message = getAxiosErrorMessage(error, 'Hubo un erro obteniedo los detalles de la factura')
            throw new Error(message)
        }
    }