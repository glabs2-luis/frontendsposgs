import { showErrorNotification, showSuccessNotification } from "@/common/helper/notification"
import { createPedidoEncAction } from "../action/pedidoenc-action"
import { PedidoEnc } from "../interfaces/pedido.enc.interface"

import { useMutation, useQuery } from '@tanstack/vue-query'

export const usePedidoEnc = (CODIGO_PEDIDO: string) => {

    const { mutate:MutatePedidoEncCrear } = useMutation({
        mutationFn: createPedidoEncAction,
        onSuccess(data) {
            showSuccessNotification("Creado","Pedido creado correctamente ha sido creado exitosamente.");
        },
        onError(error: Error) {
            showErrorNotification("Error al crear el pedido", error.message);
        },
    
    })

    return {
        MutatePedidoEncCrear,

        // Query para obtener un pedido por su código

}

}