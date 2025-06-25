import posApi from '@/api/apiPos';
import { getAxiosErrorMessage } from '../../../common/helper/geterrordb';
import { Bodega } from '../interfaces/bodegaInterface';

export const obtenerBodegasAction = async (): Promise<Bodega[]> => {
    try {
        const { data } = await posApi.get<Bodega[]>(`/bodegas`);
        return (data);
    } catch (error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener las bodegas");
        throw new Error(message);
    }
}

export const obtenerBodegasIdAction = async (id:number): Promise<Bodega[]> => {
    try {
        const { data } = await posApi.get<Bodega[]>(`/bodegas/${id}`);
        return data;
    } catch (error) {
        console.log('error', error)
        const message = getAxiosErrorMessage(error, 'Hubo un error obteniendo bodegas por ID');
        throw new Error(message);
    }
}

export const crearBodegaAction = async (bodega: Bodega) : Promise<Bodega[]> => {
    try {
        const { data } = await posApi.post<Bodega[]>(`/bodegas`, bodega);
        return data;
    } catch (error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error, 'Hubo un error creando la bodega');
        throw new Error(message);
    }
}

export const actualizarBodegaAction = async (id: number) : Promise<Bodega[]> => {
    try{
        const { data } = await posApi.patch<Bodega[]>(`/bodegas/${id}`);
        return data;
    } catch (error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error, 'Hubo un error actualizando la bodega');
        throw new Error(message);
    }
}


export const eliminarBodegaAction = async (id:number): Promise<Bodega[]> => {
    try{
        const { data } = await posApi.delete(`/bodegas/${id}`)
        return data;
    } catch(error){
        console.log('error', error)
        const message = getAxiosErrorMessage(error, 'Hubo un error eliminando la bodega')
        throw new Error(message);
    } 

}


