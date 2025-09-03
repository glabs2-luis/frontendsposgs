import { defineStore } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export const useClienteStore = defineStore("cliente", {
  state: () => ({
    idCliente: '',
    documento: '',
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  }),
  actions: {
    setCliente(datos: {
      idCliente: number,
      documento: string,
      nombre: string,
      direccion: string,
      telefono: string,
      email: string
    }) {
      this.idCliente = datos.idCliente
      this.documento = datos.documento
      this.nombre = datos.nombre
      this.direccion = datos.direccion
      this.telefono = datos.telefono
      this.email = datos.email
    },
    limpiarCliente() {
      this.idCliente = '',
      this.documento = ''
      this.nombre = ''
      this.direccion = ''
      this.telefono = ''
      this.email = ''
    }
  },
  persist: true
})