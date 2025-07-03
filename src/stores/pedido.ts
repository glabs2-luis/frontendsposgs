import { defineStore } from 'pinia'

export const usePedidoStore = defineStore('pedido', {
    state: () => ({
        idPedidoEnc: null as number | null,
        numeroDePedido: null as number | null
    }),

    actions: {
        setPedidoEncabezado(id:number, numero:number){
            this.idPedidoEnc = id
            this.numeroDePedido = numero 
        },
    
    clearPedidoEncabezado() {
        this.idPedidoEnc = null
        this.numeroDePedido = null
    }
  }

})