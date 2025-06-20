import { Cliente } from '../interfaces/clientesInterface';
import { obtenerClientesAction, crearClientesAction, usarClienteCFAction, obtenerClienteIdAction, actualizarClienteIdAction, eliminarClienteIdAction } from "../action/clientes-action";
import { useQuery } from '@tanstack/vue-query';
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showConfirmationDialog } from '@/common/helper/notification';


export const useClientes = () => {

    const queryClient = useQueryClient()

    // Obtener todos los clientes
    const { data: todosClientes, refetch: refetchTodosClientes } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => obtenerClientesAction(),
    })

    // Crear Cliente
    const { mutate: mutateCrearCliente } = useMutation ({
        mutationFn: (cliente: Partial<Cliente>) => crearClientesAction(cliente),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes']})
        }

    })

    // Mostrar Cliente CF
        const { data: mostrarcf, refetch: refetchMostrarCF } = useQuery({
        queryKey: ['clientes/cf'],
        queryFn: () => usarClienteCFAction(),
    })

    // Actualizar cliente por ID
      const { mutate: mutateActualizarClienteId } = useMutation({
      mutationFn: ({ id, cliente }: { id: number, cliente: Partial<Cliente> }) =>
      actualizarClienteIdAction(id, cliente),

      onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['cliente', variables.id] })
    }
  })

    // Eliminar cliente por ID
        const { mutate: mutateEliminarclienteId } = useMutation ({
        mutationFn: eliminarClienteIdAction,

        onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: ['clientes'] })         
        queryClient.invalidateQueries({ queryKey: ['cliente', id] })      

    }   

  })

        const eliminarClienteId = async  (id: number) => { 
            console.log('ID a eliminar:', id);
                const confirmar = await showConfirmationDialog('Eliminar cliente', '¿Estás seguro de que deseas eliminar este cliente? ');

                if (confirmar) {
                    mutateEliminarclienteId(id);
                }
                
        }

    return { 
        todosClientes,
        refetchTodosClientes,
        mutateCrearCliente,
        mostrarcf,
        refetchMostrarCF,
        mutateActualizarClienteId,
        mutateEliminarclienteId,
        eliminarClienteId
    }
}

export default useClientes;