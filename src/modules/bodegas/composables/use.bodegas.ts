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
  const { data: bodegas, refetch: refetchBodegas, isLoading: cargandoBodegas } = useQuery({
    queryKey: ['bodegas'],
    queryFn: obtenerBodegasAction,
  })

  // Crear nueva bodega
  // const { mutate: crearBodegaNueva, isPending: creandoBodega } = useMutation({
  // mutationFn: (nuevaBodega: Partial<Bodega>) => crearBodegaAction(nuevaBodega),
  // onSuccess: () => {
  //   queryClient.invalidateQueries({ queryKey: ['bodegas'] });
  // },
  // });


  // Actualizar bodega existente
  const { mutate: actualizarBodega, isPending: actualizandoBodega } = useMutation({
    mutationFn: ({id}: { id: number; bodega: Partial<Bodega> }) =>
      actualizarBodegaAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
    },
  })

  // Eliminar bodega
  const { mutate: eliminarBodega, isPending: eliminandoBodega } = useMutation({
    mutationFn: (id: number) => eliminarBodegaAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
    },
  })

  return {
    bodegas,
    refetchBodegas,
    cargandoBodegas,
    actualizarBodega,
    actualizandoBodega,
    eliminarBodega,
    eliminandoBodega,
  }
}
