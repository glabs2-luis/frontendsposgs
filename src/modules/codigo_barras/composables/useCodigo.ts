import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { obtenerCodigoBarrasAction } from '../action/codigoAction'
import { showSuccessNotification, showErrorNotification } from '@/common/helper/notification'
import { Codigo } from '../interfaces/codigoInterface';

export const useCodigo = () => {
    
  const queryClient = useQueryClient();

  // Consulta reactiva 
  const useConsultaCodigo = (codigo: string, cantidad: number) =>
    useQuery<Codigo>({
      queryKey: ['codigo-barra', codigo, cantidad],
      queryFn: () => obtenerCodigoBarrasAction(codigo, cantidad),
      enabled: !!codigo && cantidad > 0,
      refetchOnWindowFocus: false,
    });

  // Consulta manual para escaneo
  const obtenerPorCodigo = async (codigo: string, cantidad: number): Promise<Codigo | null> => {
    try {
      const data = await obtenerCodigoBarrasAction(codigo, cantidad)
      return data;
    } catch (error) {
      console.error('Error consultando código de barras', error)
      showErrorNotification('Error', 'No se pudo obtener el producto por código')
      return null;
    }
  };

  return {
    queryClient,
    useConsultaCodigo,
    obtenerPorCodigo,
  }

}