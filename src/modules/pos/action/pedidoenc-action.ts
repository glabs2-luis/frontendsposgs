import posApi from "@/api/apiPos";
import { PedidoEnc } from "../interfaces/pedido.enc.interface";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const createPedidoEncAction = async (pedido:Partial<PedidoEnc> ):Promise<PedidoEnc> => {

    try {
        const { data } = await posApi.post<PedidoEnc>(`/pedido-enc/crear`, pedido);
        return data;
    } catch (error) {
        console.log('error', error)
        const message = getAxiosErrorMessage(error, "Hubo un error al obtener el pedido");
        throw new Error(message);
    }
};

