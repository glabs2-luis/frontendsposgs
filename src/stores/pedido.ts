import { defineStore } from "pinia";
import { Cliente } from "@/modules/clientes/interfaces/clientesInterface";

export const usePedidoStore = defineStore("pedido", {
  state: () => ({
    idPedidoEnc: null as number | null,
    numeroDePedido: null as number | null,
    cliente: null as Cliente | null,
    codigoVendedor: null as number | null,
    estadoPedido: null as string | null,
  }),

  getters: {
    tipoPedido() {
      return this.estadoPedido === 'P' || !this.estadoPedido ? 'pedido' : 'cotización';
    }
  },

  actions: {
    setPedidoEncabezado(id: number, numero: number, codigoVendedor: number, estadoPedido: string) {
      this.idPedidoEnc = id;
      this.numeroDePedido = numero;
      this.codigoVendedor = codigoVendedor;
      this.estadoPedido = estadoPedido;
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
      this.estadoPedido = null;
      localStorage.removeItem("pedido");
    },
  },
  persist: true,
});
