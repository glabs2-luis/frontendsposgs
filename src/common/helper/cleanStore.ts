import { usePedidoStore } from "@/stores/pedido";
import { useTotalStore } from "@/stores/total";
import { useClienteStore } from "@/stores/cliente";

export function cleanAllStores() {
  usePedidoStore().resetStore();
  useTotalStore().resetStore();
  usePedidoStore().clearPedidoEncabezado();
  useClienteStore().limpiarCliente();
}
