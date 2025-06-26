import { Productos } from "../interfaces/productosInterface";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { obtenerProductosAction, obtenerProductosIdAction } from '../action/productosAction';
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

    return {
        todosProductos,
        refetchTodosProductos,
        obtenerProductosId
    }

}