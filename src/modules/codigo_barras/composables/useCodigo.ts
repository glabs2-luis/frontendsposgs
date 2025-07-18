import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { obtenerCodigoBarrasAction } from '../action/codigoAction'
import { showSuccessNotification, showErrorNotification } from '@/common/helper/notification'
import { Codigo } from '../interfaces/codigoInterface';

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
      console.error('El producto no tiene codigo de barras', error)

    }
  }

  return {
    queryClient,
    consultarCodigo,
    consultarCodigoM
  }

}