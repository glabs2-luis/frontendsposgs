import { useQuery } from '@tanstack/vue-query'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { showConfirmationDialog } from '@/common/helper/notification'
import { 
    crearSincronizacionAction, 
    statusSincronizacionAction, 
    obtenerConfigSincronizacionAction, 
    obtenerConfigTransferenciaAction, 
    obtenerEstadoConexionAction, 
    obtenerArchivosCreadosAction, 
    obtenerArchivosTransferidosAction, 
    obtenerArchivosErroresAction, 
    reintentarEnviarArchivosAction 
} from '../action/syncAction'   


export const useSync = () => {

    const queryClient = useQueryClient()

    // Crear sincronización
    const { mutate: mutateCrearSincronizacion } = useMutation({
        mutationFn: (id: number) => crearSincronizacionAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sync/files/created'] })
            queryClient.invalidateQueries({ queryKey: ['sync/files/transferred'] })
            queryClient.invalidateQueries({ queryKey: ['sync/files/errors'] })
        }
    })

    // Obtener estado de sincronización
    const { data: estadoSincronizacion, refetch: refetchEstadoSincronizacion } = useQuery({
        queryKey: ['sync/status'],
        queryFn: () => statusSincronizacionAction(),
    })

    // Obtener configuración de sincronización
    const { data: configSincronizacion, refetch: refetchConfigSincronizacion } = useQuery({
        queryKey: ['sync/config'],
        queryFn: () => obtenerConfigSincronizacionAction(),
    })

    // Obtener configuración de transferencia
    const { data: configTransferencia, refetch: refetchConfigTransferencia } = useQuery({
        queryKey: ['sync/transfer/config'],
        queryFn: () => obtenerConfigTransferenciaAction(),
    })

    // Obtener estado de conexión
    const { data: estadoConexion, refetch: refetchEstadoConexion } = useQuery({
        queryKey: ['sync/connection/status'],
        queryFn: () => obtenerEstadoConexionAction(),
    })

    // Archivos creados
    const { data: archivosCreados, refetch: refetchArchivosCreados } = useQuery({
        queryKey: ['sync/files/created'],
        queryFn: () => obtenerArchivosCreadosAction(),
    })

    // Archivos transferidos
    const { data: archivosTransferidos, refetch: refetchArchivosTransferidos } = useQuery({
        queryKey: ['sync/files/transferred'],
        queryFn: () => obtenerArchivosTransferidosAction(),
    })

    // Archivos con errores
    const { data: archivosErrores, refetch: refetchArchivosErrores } = useQuery({
        queryKey: ['sync/files/errors'],
        queryFn: () => obtenerArchivosErroresAction(),
    })

    // Reintentar enviar archivos con errores           
    const { mutate: reintentarEnviarArchivos } = useMutation({
        mutationFn: () => reintentarEnviarArchivosAction(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sync/files/errors'] })
            queryClient.invalidateQueries({ queryKey: ['sync/files/created'] })
            queryClient.invalidateQueries({ queryKey: ['sync/files/transferred'] }) 
        }
    })

    return {
        mutateCrearSincronizacion,  
        estadoSincronizacion,
        refetchEstadoSincronizacion,
        configSincronizacion,
        refetchConfigSincronizacion,
        configTransferencia,
        refetchConfigTransferencia,
        estadoConexion,
        refetchEstadoConexion,
        archivosCreados,
        refetchArchivosCreados,
        archivosTransferidos,
        refetchArchivosTransferidos,
        refetchArchivosErrores,
        reintentarEnviarArchivos, 
        archivosErrores
    }
}

export default useSync