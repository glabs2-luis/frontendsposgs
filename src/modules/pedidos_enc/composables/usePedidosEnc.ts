import { PedidosEnc } from '../interfaces/pedidoEncInterface';
import {
  crearPedidoEncAction,
  obtenerPedidosPendientesAction,
  obtenerPedidoEncPorIdAction,
  eliminarPedidoEncAction, obtenerPedidoEncPorIdAction2
} from '../action/pedidosEnc-action';

import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { showConfirmationDialog } from '@/common/helper/notification';

export const usePedidosEnc = () => {

  const queryClient = useQueryClient();

  // Pedidos pendientes
  const obtenerPedidosPendientes = (id_sucursal: number, codigo_vendedor: number) => {
    return useQuery({
      queryKey: ['pedidos-pendientes', id_sucursal, codigo_vendedor],
      queryFn: () => obtenerPedidosPendientesAction(id_sucursal, codigo_vendedor),
      enabled: !!id_sucursal && !!codigo_vendedor 
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
  }
  
  const obtenerPedido2 = (id:number) => {
  const {data: obtenerPedido2, refetch: refetchObtenerPedido2 } = useQuery ({
    queryKey: ['pedido-enc', id],
    queryFn: () => obtenerPedidoEncPorIdAction2(id)
  })

  return {
    obtenerPedido2,
    refetchObtenerPedido2
  }

  }


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
    eliminarPedido,
    obtenerPedido2
  };
};

export default usePedidosEnc;