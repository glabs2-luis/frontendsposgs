import { FelSeries } from '../interfaces/felSeriesInterface'
import { ref } from 'vue'
import { getAxiosErrorMessage } from '@/common/helper/geterrordb'
import posApi from '@/api/apiPos'

// Obtener todas las series
export const obtenerSeriesAction = async (): Promise<FelSeries[]> => {
    try {
        const { data } = await posApi.get<FelSeries[]>(`/fel-establecimiento-series`)
        return data
    } catch (error){
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo las series')
        throw new Error(message) 
    }
}

// Crear una serie
export const crearSeriesAction = async (sucursal:number, codigo:number, serie:string) : Promise<FelSeries[]> => {
    try {
        const { data } = await posApi.post<FelSeries[]>(`/fel-establecimiento-series`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, 'Hubo un error creando una serie')
        throw new Error(message)
    }
}

// Obtener una serie por sucursal 
export const obtenerSeriesPorSucursalAction = async (id: number) : Promise<FelSeries[]> => {
    try {
        const { data } = await posApi.get<FelSeries[]>(`/fel-establecimiento-series/by-sucursal/${id}`)
        return data
    } catch ( error){
        console.log(error, 'error en el action')
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo series por id sucursal')
        throw new Error(message)
    }
}