import { defineStore } from 'pinia'
import { Cliente } from '@/modules/clientes/interfaces/clientesInterface'

export const usePedidoStore = defineStore('pedido', {
    state: () => ({
        idPedidoEnc: null as number | null,
        numeroDePedido: null as number | null,
        cliente: null as Cliente | null
    }),

    actions: {
        setPedidoEncabezado(id:number, numero:number){
            this.idPedidoEnc = id
            this.numeroDePedido = numero 
        },
    
    setCliente(clienteData: Cliente){
        this.cliente = clienteData
    },


    clearPedidoEncabezado() {
        this.idPedidoEnc = null
        this.numeroDePedido = null
        this.cliente = null
    }
  },
 persist: true
}, )