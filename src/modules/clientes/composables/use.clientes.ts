import { Cliente } from "../interfaces/clientesInterface";
import { obtenerClientesAction } from "../action/clientes-action";
import { useQuery } from '@tanstack/vue-query';

export const useClientes = (cliente: Cliente) => {

    const { data: todosclientes, } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => obtenerClientesAction(),
    })

    return { 
        todosclientes,
    }
}