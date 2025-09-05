import { PedidosDet } from "../interfaces/pedidosDetInterface";
import { computed, ref, Ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  crearPedidoDetAction,
  actualizarDescripcionPedidoDetAction,
  eliminarPedidoDetId,
  obtenerPedidoDetIdAction,
  obtenerListaPedidosDet,
  actualizarCantidadPedidoDetAction,
  actualizarPrecioPedidoDetAction,
} from "../action/pedidosDetAction";
import { showErrorNotification } from "@/common/helper/notification";

export const usePedidoDet = () => {
  const queryClient = useQueryClient();

  // Crear Pedido detalle
  const { mutate: mutateCrearPedidoDet } = useMutation({
    mutationFn: (PedidosDet: Partial<PedidosDet>) =>
      crearPedidoDetAction(PedidosDet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-det"] });
    },
    onError: (error: Error) => {
      showErrorNotification("Error", error.message);
    },
  });

  // Obtener pedido Detalle por ID
  const obtenerPedidosDetID = async (id: number) => {
    try {
      const ped = await obtenerPedidoDetIdAction(id);
      return ped ?? null;
    } catch (error) {
      return null;
    }
  };

  // Actualizar descripcion detalle
  const { mutate: mutateActualizarPedidoDetId } = useMutation({
    mutationFn: (params: { id: number; descripcion: string }) =>
      actualizarDescripcionPedidoDetAction(params.id, params.descripcion),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pedidos-det-actualizar-descripcion"],
      });
    },
    onError: (error: Error) => {
      showErrorNotification("Error", error.message);
    },
  });

  // Actualizar cantidad en pedido det
  const { mutate: mutateActualizarCantidadPedidoDetID } = useMutation({
    mutationFn: (params: { id: number; cantidad: number }) =>
      actualizarCantidadPedidoDetAction(params.id, params.cantidad),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pedidos-det-actualizar-cantidad"],
      });
    },
    onError: (error: Error) => {
      showErrorNotification("Error", error.message);
    },
  });

  // Actualizar precio en pedido det
  const { mutate: mutateActualizarPrecioPedidoDetID } = useMutation({
    mutationFn: (params: { id: number; precio: number }) =>
      actualizarPrecioPedidoDetAction(params.id, params.precio),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pedidos-det-actualizar-precio"],
      });
    },
    onError: (error: Error) => {
      showErrorNotification("Error", error.message);
    },
  });

  // eliminar pedido detalle Id
  const { mutate: mutateEliminarPedidoDetID } = useMutation({
    mutationFn: eliminarPedidoDetId,
    onSuccess: () => {
      // Invalidar todas las queries relacionadas con pedidos-det
      queryClient.invalidateQueries({ queryKey: ["pedidos-det"] });
      queryClient.invalidateQueries({ queryKey: ["pedido-det"] });
      queryClient.invalidateQueries({ queryKey: ["pedido-enc"] });
      queryClient.invalidateQueries({ queryKey: ["pedido-enc-id"] });
    },
    onError: (error: Error) => {
      showErrorNotification("Error", error.message);
    },
  });

  // obtener lista pedidos det
  // const ListaDet1 = (idPedidoEnc: Ref<number | null>) => {

  //   return useQuery({
  //      este es el que falla
  //     queryKey: computed(() => ["pedido-det", idPedidoEnc.value]),
  //     queryFn: () => obtenerListaPedidosDet(idPedidoEnc.value),
  //     enabled: computed(() => !!idPedidoEnc.value && idPedidoEnc.value > 0),
  //   });
  // };

  // const ListaDet2 = (idPedidoEnc: Ref<number | null>) => {
  //   return useQuery({
  //     queryKey: computed(() => ["pedido-det", idPedidoEnc.value]),
  //     queryFn: () => obtenerListaPedidosDet(idPedidoEnc.value),
  //     enabled: computed(() => !!idPedidoEnc.value && idPedidoEnc.value > 0),
  //     refetchOnWindowFocus: false,
  //   });
  // };

  const useListaProductosPedidoDet = (idPedidoEnc: Ref<number, number>) => {
    return useQuery({
      queryKey: computed(() => ["pedidoDet", idPedidoEnc.value]),
      queryFn: () => obtenerListaPedidosDet(idPedidoEnc.value),
      enabled: computed(() => !!idPedidoEnc && idPedidoEnc.value > 0),
      // enabled: !!idPedidoEnc,
      refetchOnWindowFocus: false,
    });
  };

  return {
    mutateCrearPedidoDet,
    obtenerPedidosDetID,
    mutateActualizarPedidoDetId,
    mutateActualizarCantidadPedidoDetID,
    mutateEliminarPedidoDetID,
    mutateActualizarPrecioPedidoDetID,
    // ListaDet1,
    useListaProductosPedidoDet,
    // ListaDet2,
  };
};
