import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  obtenerBodegasAction,
  crearBodegaAction,
  actualizarBodegaAction,
  eliminarBodegaAction
} from '../action/bodega-action';

import { Bodega } from '../interfaces/bodegaInterface';

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

  return {
    bodegas,
    refetchBodegas,
    mutateActualizarBodega,
    mutateEliminarBodega
  }
}
