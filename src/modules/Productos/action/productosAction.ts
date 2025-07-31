import posApi from "@/api/apiPos"
import { getAxiosErrorMessage } from "@/common/helper/geterrordb"
import { Productos } from "../interfaces/productosInterface"

// Obtener todos los productos
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

// por Id
export const obtenerProductosIdAction = async (producto: string) : Promise<Productos[]> => {
    try {
        const { data } = await posApi.get<Productos[]>(`/maestro-productos/${producto}`)
         console.log('data', data)
            return data
        } catch (error) {
            console.log('error', error)
            const message = getAxiosErrorMessage(error, "Hubo un error obteniendo los productos por Id")
            throw new Error(message)
        }
    }

    // Obtener Precio
export const ObtenerProductosPrecioAction = async (producto: string, cantidad: number): Promise<Productos> => {
    try{
        const { data } = await posApi.get<Productos>(`/maestro-productos/precioProducto/${producto}/${cantidad}`)
        console.log('Action', data)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener el precio del producto")
        console.log(message)
    }
}