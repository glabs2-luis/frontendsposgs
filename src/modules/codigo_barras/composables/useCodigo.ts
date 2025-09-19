import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { obtenerCodigoBarrasAction, obtenerProductoPorCodigoAction } from '../action/codigoAction'
import { showSuccessNotification, showErrorNotification } from '@/common/helper/notification'
import { Codigo } from '../interfaces/codigoInterface';
import { getAxiosErrorMessage } from '@/common/helper/geterrordb';
import { computed, Ref, warn } from 'vue';

export const useCodigo = () => {
    
  const queryClient = useQueryClient();

  // Consulta reactiva 
  const consultarCodigo = (codigo: string, cantidad: number) =>
    useQuery<Codigo>({
      queryKey: ['codigo-barra', codigo, cantidad],
      queryFn: () => obtenerCodigoBarrasAction(codigo, cantidad),
      enabled: !!codigo && cantidad > 0,
      refetchOnWindowFocus: false,
    })

  // Consulta manual para escaneo
  // el error es porque se envia cero
  const consultarCodigoM = async (codigo: string, cantidad: number): Promise<Codigo | null> => {
    try {
      const data = await obtenerCodigoBarrasAction(codigo, cantidad)
      return data
    } catch (error) {
      const message = getAxiosErrorMessage(error, 'El producto no tiene codigo de barras')
      throw new Error(message)
    }
  }

  const obtenerProducto = (codigo: Ref<string>) => useQuery({
    queryKey: ['codigo-barra-producto', codigo],
    queryFn: () => obtenerProductoPorCodigoAction(codigo.value),
    enabled: false
  })
  
  const obtenerProducto2 = (codigo: Ref<string>) => useQuery({
    queryKey: computed(() => ['codigo-barra-producto2', codigo]),
    queryFn: () => obtenerProductoPorCodigoAction(codigo.value),
    enabled: computed(() => !!codigo.value)
  })

//   const obtenerProducto2 = async (codigo: string) => {
//   return await obtenerProductoPorCodigoAction(codigo)
// }

  return {
    queryClient,
    consultarCodigo,
    consultarCodigoM,
    obtenerProducto,
    obtenerProducto2
  }

}