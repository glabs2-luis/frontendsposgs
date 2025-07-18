import posApi from "@/api/apiPos"
import { getAxiosErrorMessage } from "@/common/helper/geterrordb"

// crear Sincronizacion
export const crearSincronizacionAction = async (idFacturaEnc: number): Promise<void> => {
    try {
    const { data } = await posApi.post(`/sync/export-transfer-background/factura/${idFacturaEnc}`)
    return data
    } catch (error) {           
   console.error('Error al crear sincronización:', error)
   const message = getAxiosErrorMessage(error, "Hubo un error al crear la sincronización")
   throw new Error(message)
    }
}

// obteneer estado de sincronización
export const statusSincronizacionAction = async (): Promise<void> => {
    try {
        const { data } = await posApi.get(`/sync/status`)
        console.log('Datos sincronizados:', data)
        return data
    } catch (error) {
        console.error('Error al sincronizar datos:', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al sincronizar los datos")
        throw new Error(message)
    }
}

// obtener config de la sincronización
export const obtenerConfigSincronizacionAction = async (): Promise<void> => {
    try {
        const { data } = await posApi.get(`/sync/config`)
        console.log('Configuración de sincronización:', data)
        return data
    } catch (error) {
        console.error('Error al obtener configuración de sincronización:', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener la configuración de sincronización")
        throw new Error(message)
    }
}   

export const obtenerEstadoConexionAction = async (): Promise<void> => {
    try {
        const { data } = await posApi.get(`/sync/conectionStatus`)
        console.log('Estado de conexión:', data)
        return data
    } catch (error) {
        console.error('Error al obtener estado de conexión:', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener el estado de conexión")
        throw new Error(message)
    }
}   

export const obtenerArchivosCreadosAction = async (): Promise<void> => {
    try {
        const { data } = await posApi.get(`/sync/files/created`)
        console.log('Archivos creados:', data)
        return data
    } catch (error) {
        console.error('Error al obtener archivos creados:', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos creados")
        throw new Error(message)
    }
}   

export const obtenerArchivosTransferidosAction = async (): Promise<void> => {
    try {
        const { data } = await posApi.get(`/sync/files/transferred`)
        console.log('Archivos transferidos:', data)
        return data
    } catch (error) {
        console.error('Error al obtener archivos transferidos:', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos transferidos")
        throw new Error(message)
    }
}    

export const obtenerArchivosErroresAction = async (): Promise<void> => {
    try {
        const { data } = await posApi.get(`/sync/files/error`)
        console.log('Archivos con errores:', data)
        return data
    } catch (error) {
        console.error('Error al obtener archivos con errores:', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos con errores")
        throw new Error(message)
    }
}   

export const reintentarEnviarArchivosAction = async (): Promise<void> => {
    try {
        const { data } = await posApi.post(`/sync/retry/error-files`)
        console.log('Archivos reintentados:', data)
        return data
    } catch (error) {
        console.error('Error al obtener archivos reintentados:', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los archivos reintentados")
        throw new Error(message)
    }
}   



