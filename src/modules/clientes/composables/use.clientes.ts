import { Cliente } from '../interfaces/clientesInterface';
import { obtenerClientesAction, crearClientesAction, usarClienteCFAction, obtenerClienteIdAction, actualizarClienteIdAction, eliminarClienteIdAction, obtenerClienteDPINITAction } from '../action/clientes-action';
import { useQuery } from '@tanstack/vue-query';
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showConfirmationDialog } from '@/common/helper/notification';
import { ref } from 'vue';


export const useClientes = () => {

    const queryClient = useQueryClient()

    // Obtener todos los clientes
    const { data: todosClientes, refetch: refetchTodosClientes } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => obtenerClientesAction(),
    })

    // Obtener cliente por Nit o CUi
    const obtenerClientePorDocumento = async (documento: string, tipo: 'dpi' | 'nit') => {
         try {
        const cliente = await obtenerClienteDPINITAction(documento, tipo)

            if (cliente) {
            return cliente
            } else {
            console.log('No se encontró cliente.')
            return null
            }
             } catch (error) {
            console.error('Error buscando cliente:', error)
            return null
        }
    
    }
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
      mutationFn: actualizarClienteIdAction,

      onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['cliente', id] })
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

        const actualizarClienteIdActionClienteId = async  (id: number) => { 
            console.log('ID a actualizar:', id);
                const confirmar = await showConfirmationDialog('Editar cliente', '¿Estás seguro de que deseas editareste cliente? ');

                if (confirmar) {
                    mutateActualizarClienteId(id);
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
        eliminarClienteId,
        obtenerClientePorDocumento
    }
}

export default useClientes;