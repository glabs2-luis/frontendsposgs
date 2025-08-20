import { Productos } from "../interfaces/productosInterface"
import { useQuery, useQueryClient } from "@tanstack/vue-query"
import { obtenerProductosAction, obtenerProductosIdAction, ObtenerProductosPrecioAction } from '../action/productosAction';
import { showConfirmationDialog, showErrorNotification } from "@/common/helper/notification";

export const useProductos = () => {

    const queryClient = useQueryClient()

    //obtener todos los Productos
    const { data: todosProductos, refetch: refetchTodosProductos } = useQuery ({
        queryKey: ['productos'],
        queryFn: () => obtenerProductosAction(),
    }) 

    // obtener  productos por Id
    const obtenerProductosId = async (codigo: string) => {
        try {
            const producto = await obtenerProductosIdAction(codigo)
            return producto
        } catch(error){
            console.log('Error buscando por producto', error)
            showErrorNotification('Error','Error consultando producto')
            return null
        }
    }

    // Obtener precio del producto
    const precioReal = async (codigo: string, cantidad: number): Promise<Productos> => {
        try {
            const productoPrecio = await ObtenerProductosPrecioAction(codigo, cantidad)
            //console.log('composable: ', productoPrecio)
            return productoPrecio
        } catch (error) {
            console.log('Error obteniendo precio del producto', error)
            // showErrorNotification('Error', 'Error obteniendo precio del producto')
        }
    }

    return {
        todosProductos,
        refetchTodosProductos,
        obtenerProductosId,
        precioReal
    }

}