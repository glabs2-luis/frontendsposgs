import { defineStore } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'

export const useClienteStore = defineStore("cliente", {
  state: () => ({
    documento: '',
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  }),
  actions: {
    setCliente(datos: {
      documento: string,
      nombre: string,
      direccion: string,
      telefono: string,
      email: string
    }) {
      this.documento = datos.documento
      this.nombre = datos.nombre
      this.direccion = datos.direccion
      this.telefono = datos.telefono
      this.email = datos.email
    },
    limpiarCliente() {
      this.documento = ''
      this.nombre = ''
      this.direccion = ''
      this.telefono = ''
      this.email = ''
    }
  },
  persist: true
})