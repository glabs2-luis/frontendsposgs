import { defineStore } from "pinia";
import { Cliente } from "@/modules/clientes/interfaces/clientesInterface";

export const usePedidoStore = defineStore("pedido", {
  state: () => ({
    idPedidoEnc: null as number | null,
    numeroDePedido: null as number | null,
    cliente: null as Cliente | null,
    codigoVendedor: null as number | null,
  }),

  actions: {
    setPedidoEncabezado(id: number, numero: number, codigoVendedor: number) {
      this.idPedidoEnc = id;
      this.numeroDePedido = numero;
      this.codigoVendedor = codigoVendedor;
    },

    setCliente(clienteData: Cliente) {
      this.cliente = clienteData;
    },

    // compatible con persist
    resetStore() {
      this.$reset();
    },

    clearPedidoEncabezado() {
      this.idPedidoEnc = null;
      this.numeroDePedido = null;
      this.cliente = null;
      localStorage.removeItem("pedido");
    },
  },
  persist: true,
});
