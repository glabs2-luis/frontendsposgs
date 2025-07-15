import { usePedidoStore } from "@/stores/pedido"
import { useTotalStore } from "@/stores/total"

export function cleanAllStores() {
    usePedidoStore().resetStore()
    useTotalStore().resetStore()
    usePedidoStore().clearPedidoEncabezado()
}


