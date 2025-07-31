import { Cliente } from '../interfaces/clientesInterface';
import { obtenerClientesAction, 
    crearClientesAction, 
    usarClienteCFAction, obtenerClienteIdAction, 
    actualizarClienteIdAction, 
    eliminarClienteIdAction, 
    obtenerClienteDPINITAction } from '../action/clientesAction'
    
import { useQuery } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from "@tanstack/vue-query"
import { showConfirmationDialog } from '@/common/helper/notification'

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
            const message = ('NIT no existente, se creara el cliente')
            console.log(message)
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


    // Eliminar cliente por ID
        const { mutate: mutateEliminarclienteId } = useMutation ({
        mutationFn: eliminarClienteIdAction,

        onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: ['clientes'] })         
        queryClient.invalidateQueries({ queryKey: ['cliente', id] })      
    }   

  })

        const eliminarClienteId = async  (id: number) => { 
            console.log('ID a eliminar:', id)
                const confirmar = await showConfirmationDialog('Eliminar cliente', '¿Estás seguro de que deseas eliminar este cliente? ')

                if (confirmar) {
                    mutateEliminarclienteId(id)
                }
        }

        const { mutate: mutateActualizarClienteId2 } = useMutation({
          mutationFn: ({ id, data }: { id: number, data: any }) => actualizarClienteIdAction(id, data),
          onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] })
            queryClient.invalidateQueries({ queryKey: ['cliente', id] })
          }
        })


    return { 
        todosClientes,
        refetchTodosClientes,
        mutateCrearCliente,
        mostrarcf,
        refetchMostrarCF,
        mutateEliminarclienteId,
        eliminarClienteId,
        obtenerClientePorDocumento,
        mutateActualizarClienteId2,
    }
}

export default useClientes