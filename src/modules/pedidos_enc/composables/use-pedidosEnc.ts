import { PedidosEnc } from '../interfaces/pedidoEncInterface';
import {
  crearPedidoEncAction,
  obtenerPedidosPendientesAction,
  obtenerPedidoEncPorIdAction,
  eliminarPedidoEncAction
} from '../action/pedidosEnc-action';

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { showConfirmationDialog } from '@/common/helper/notification';

export const usePedidosEnc = () => {

  const queryClient = useQueryClient();

  // Pedidos pendientes
  const obtenerPedidosPendientes = (ID_SUCURSAL: number, CODIGO_VENDEDOR: number) => {
    return useQuery({
      queryKey: ['pedidos-pendientes', ID_SUCURSAL, CODIGO_VENDEDOR],
      queryFn: () => obtenerPedidosPendientesAction(ID_SUCURSAL, CODIGO_VENDEDOR),
      enabled: !!ID_SUCURSAL && !!CODIGO_VENDEDOR 
    });
  };

  // Crear pedido
  const { mutate: mutateCrearPedidoEnc } = useMutation({
    mutationFn: (pedido: Partial<PedidosEnc>) => crearPedidoEncAction(pedido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes'] });
    }
  });

  // Obtener pedido por ID
  const obtenerPedidoPorId = (id: number) => {
    const { data, refetch: refetchObtenerPedidoID } =  useQuery({
      queryKey: ['pedido', id],
      queryFn: () => obtenerPedidoEncPorIdAction(id),
      enabled: !!id
    });

    return { data, refetchObtenerPedidoID }
  };

  // Eliminar pedido por ID
  const { mutate: mutateEliminarPedido } = useMutation({
    mutationFn: eliminarPedidoEncAction,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['pedido', id] });
    }
  });

  const eliminarPedido = async (ID_PEDIDO_ENC: number) => {
    const confirmar = await showConfirmationDialog(
      'Eliminar pedido',
      '¿Estás seguro de que deseas eliminar este pedido?'
    );
    if (confirmar) {
      mutateEliminarPedido(ID_PEDIDO_ENC);
    }
  };

  return {
    obtenerPedidosPendientes,
    mutateCrearPedidoEnc,
    obtenerPedidoPorId,
    eliminarPedido
  };
};

export default usePedidosEnc;
