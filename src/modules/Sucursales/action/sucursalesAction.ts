import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { Sucursal } from "../interfaces/sucursalesInterface";

export const obtenerSucursalAction = async(): Promise<Sucursal[]> => {
    try {
        const { data } = await posApi.get<Sucursal[]>(`/sucursales/`);
        return data;
    } catch (error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error, "hubo un error obteniendo sucursales");
        throw new Error(message);
    }
}

export const obtenerSucursalIdAction = async (id: number): Promise<Sucursal[]> => {
    try {
        const { data } = await posApi.get<Sucursal[]>(`/sucursales/${id}`)
        return data;
    } catch(error){
        const message = getAxiosErrorMessage(error, "Hubo un error obteniendo sucursal por ID")
        throw new Error(message)
    }
}


export const eliminarScucursalAction = async(): Promise<Sucursal[]> => {
    try {
        const { data } = await posApi.delete(`/sucursales/`)
        return data
    } catch(error){
        const message = getAxiosErrorMessage(error, "Hubo un error eliminado la sucursal")
        throw new Error(message)
    }
}