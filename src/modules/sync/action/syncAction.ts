import posApi from "@/api/apiPos"
import { getAxiosErrorMessage } from "@/common/helper/geterrordb"
import { SyncFac } from "../interface/syncInterface"
import { SyncStatus } from "../interface/syncStatusInterface"
import { SyncConfig } from "../interface/syncConfigInterface"
import { TransferConfig } from "../interface/transferConfigInterface"
import { ConexionStatus } from "../interface/conexionStatusInterface"
import { RetryErrors } from "../interface/retryInterface"
import { FilesError } from "../interface/filesErrorInterface"
import { FilesTransferred } from "../interface/filesTransferredInterface"
import { FilesCreated } from "../interface/filesCreatedInterface"

// crear Sincronizacion
export const crearSincronizacionAction = async (idFacturaEnc: number): Promise<SyncFac> => {
    try {
    const { data } = await posApi.post<SyncFac>(`/sync/export-transfer-background/factura/${idFacturaEnc}`)
    return data
    } catch (error) {           
   const message = getAxiosErrorMessage(error, "Hubo un error al crear la sincronización")
   throw new Error(message)
    }
}

// obtener estado de sincronización
export const statusSincronizacionAction = async (): Promise<SyncStatus> => {
    try {
        const { data } = await posApi.get<SyncStatus>(`/sync/status`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al sincronizar los datos")
        throw new Error(message)
    }
}

// obtener config de la sincronización
export const obtenerConfigSincronizacionAction = async (): Promise<SyncConfig> => {
    try {
        const { data } = await posApi.get<SyncConfig>(`/sync/config`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener la configuración de sincronización")
        throw new Error(message)
    }
}   

// obtener configuracion de la transferencia
export const obtenerConfigTransferenciaAction = async (): Promise<TransferConfig> => {
    try {
        const { data } = await posApi.get<TransferConfig>(`/sync/transfer/config`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener la configuración de transferencia")
        throw new Error(message)
    }
}

// Obtener estado de conexion 
export const obtenerEstadoConexionAction = async (): Promise<ConexionStatus> => {
    try {
        const { data } = await posApi.get<ConexionStatus>(`/sync/transfer/conectionStatus`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener el estado de conexión")
        throw new Error(message)
    }
}   

// Archivos creados
export const obtenerArchivosCreadosAction = async (): Promise<FilesCreated> => {
    try {
        const { data } = await posApi.get<FilesCreated>(`/sync/files/created`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos creados")
        throw new Error(message)
    }
}   

// Archivos transferidos
export const obtenerArchivosTransferidosAction = async (): Promise<FilesTransferred> => {
    try {
        const { data } = await posApi.get<FilesTransferred>(`/sync/files/transferred`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos transferidos")
        throw new Error(message)
    }
}    

// Archivos con errores
export const obtenerArchivosErroresAction = async (): Promise<FilesError> => {
    try {
        const { data } = await posApi.get<FilesError>(`/sync/files/error`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos con errores")
        throw new Error(message)
    }
}   

// Reintentar enviar archivos con errores
export const reintentarEnviarArchivosAction = async (): Promise<RetryErrors> => {
    try {
        const { data } = await posApi.post<RetryErrors>(`/sync/retry/error-files`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos reintentados")
        throw new Error(message)
    }
}   

