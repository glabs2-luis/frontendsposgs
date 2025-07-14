import posApi from "@/api/apiPos";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";
import { Cliente } from "../interfaces/clientesInterface";  

export const obtenerClientesAction = async (): Promise<Cliente[]> => {
    try {
        const { data } = await posApi.get<Cliente[]>(`/clientes/`);
        return data;
    } catch (error) {
        console.log('error', error);
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener los clientes");
        throw new Error(message);
    }
}
    
 export const crearClientesAction = async (cliente: Partial<Cliente>): Promise<Cliente> => {
    try {
        const { data } = await posApi.post<Cliente>(`/clientes`, cliente);
        return data;
    } catch (error) {
        console.log('error', error);
        const message = getAxiosErrorMessage(error, "Hubo un error al crear el cliente");
        throw new Error(message);
    }

 }

 export const usarClienteCFAction = async ():
 Promise<Cliente> => {
    try { 
        const { data } = await posApi.get<Cliente>(`/clientes/cf`)
        return data
    } catch (error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener consumidor final");
        throw new Error(message);
    }
 }

export const obtenerClienteIdAction = async (id: number):
Promise<Cliente> => {
    try {
        const { data } = await posApi.get<Cliente>(`clientes/${id}`)
        return data
    } catch (error){
        console.log('Error', error)
        const message = getAxiosErrorMessage(error, "Hubo un error obteniendo cliente por ID");
        throw new Error(message);
    }
}

export const actualizarClienteIdAction = async (id: number):
Promise<Cliente> => {
    try {
        const { data } = await posApi.patch<Cliente>(`/clientes/${id}`)
        return data
    } catch (error){
        const message = getAxiosErrorMessage(error, "Hubo un error actualizando cliente por ID")
        throw new Error(message);
    }
}

export const eliminarClienteIdAction = async (id: number):
Promise<Cliente> => {
    try {
        const { data } = await posApi.delete(`clientes/${id}`)
        return data
    } catch (error){
        const message = getAxiosErrorMessage(error, "hubo un error eliminando un cliente por ID")
        throw new Error(message);
    }
}


export const obtenerClienteDPINITAction = async (nitcui:string, tipo: 'dpi'|'nit'):
Promise<Cliente> => {
    try {
        const { data } = await posApi.get<Cliente>(`/clientes/${nitcui}/${tipo}`)
        return data
    } catch (error) {
        const message = getAxiosErrorMessage(error, "Hubo un error obteniendo cliente por DPI o NIT");
        throw new Error(message);
    }
}

