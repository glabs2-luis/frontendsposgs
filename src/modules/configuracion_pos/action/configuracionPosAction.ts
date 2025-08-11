import posApi from "@/api/apiPos"
import { getAxiosErrorMessage } from "@/helper/geterrordb"
import { ConfiguracionPos } from '../interfaces/configuracionPosInterface';

export const configuracionPosAction = async() : Promise<ConfiguracionPos> => {
    try {
        const { data } = await posApi.get<ConfiguracionPos>(`/configuracion-pos`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo la configuracion pos')
        console.log(message)
        throw new Error(message)
    }
}

