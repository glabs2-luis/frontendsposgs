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