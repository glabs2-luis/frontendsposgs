import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { Productos } from "../interfaces/productosInterface";

export const obtenerProductosAction = async (): Promise<Productos[]> => {
    try {
        const { data } = await posApi.get<Productos[]>(`/maestro-productos`)
        return data
    } catch (error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error, "Hubo un error obteniendo todos los productos")
        throw new Error(message)
    }
}

export const obtenerProductosIdAction = async (producto: string) : Promise<Productos[]> => {
    try {
        const { data } = await posApi.get<Productos[]>(`/maestro-productos/${producto}`)
            return data
        } catch (error) {
            console.log('error', error)
            const message = getAxiosErrorMessage(error, "Hubo un error obteniendo los productos por Id")
            throw new Error(message)
        }

    }
