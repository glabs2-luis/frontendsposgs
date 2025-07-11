import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  obtenerBodegasAction,
  crearBodegaAction,
  actualizarBodegaAction,
  eliminarBodegaAction, obtenerBodegasIdAction
} from '../action/bodegaAction';

import { Bodega } from '../interfaces/bodegaInterface';
import { getAxiosErrorMessage } from '@/common/helper/geterrordb';


export const useBodegas = () => {
  const queryClient = useQueryClient();

  // Obtener todas las bodegas
  const { data: bodegas, refetch: refetchBodegas } = useQuery({
    queryKey: ['bodegas'],
    queryFn: () => obtenerBodegasAction,
  })

  // Actualizar bodega existente
  const { mutate: mutateActualizarBodega } = useMutation({
    mutationFn: actualizarBodegaAction,

    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
      queryClient.invalidateQueries({ queryKey: ['bodegas', id] })
    },
  })

  // Eliminar bodega
  const { mutate: mutateEliminarBodega } = useMutation({
    mutationFn: (id: number) => eliminarBodegaAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
    },
  })

  const ObtenerBodegasId2 = async () => {
    try {
    const response = await obtenerBodegasIdAction(1)
    return response;
    } catch (error){
      const message = getAxiosErrorMessage(error, "Hubo un error xd")
      console.log(message)
      throw new Error(error)
    }
  }

  const { data: obtenerBodegasId, refetch: refetchBbtenerBodegasId } = useQuery({
    queryKey:['bodegas-id'],
    queryFn: () => obtenerBodegasIdAction(1),
  })

  return {
    bodegas,
    refetchBodegas,
    mutateActualizarBodega,
    mutateEliminarBodega, 
    obtenerBodegasId,
    refetchBbtenerBodegasId,
    ObtenerBodegasId2
  }
}
