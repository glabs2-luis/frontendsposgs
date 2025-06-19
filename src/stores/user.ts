import { loginVendedorAction } from '@/modules/login/action/login-vendedor.action'
import { useMutation } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const nombreVendedor = ref('')
  const codigoVendedor = ref<number | null>(null)

  const cerrarSesion = () => {
    nombreVendedor.value = ''
    codigoVendedor.value = null
  }

  const {mutate:loginMutation} = useMutation({
    mutationFn: 
      loginVendedorAction,

    onSuccess(data) {
      nombreVendedor.value = data.NOMBRE_VENDEDOR
      codigoVendedor.value = data.CODIGO_VENDEDOR
    },
    onError() {
      cerrarSesion()
      
    },
  })

  return {
    nombreVendedor,
    codigoVendedor,
    cerrarSesion,
    loginMutation, 
  }
})
