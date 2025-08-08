import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import {
  obtenerBodegasAction,
  crearBodegaAction,
  actualizarBodegaAction,
  eliminarBodegaAction,
  obtenerBodegasIdAction,
} from "../action/bodegaAction";

import { Bodega } from "../interfaces/bodegaInterface";
import { getAxiosErrorMessage } from "@/common/helper/geterrordb";

export const useBodegas = () => {
  const queryClient = useQueryClient();

  // Obtener todas las bodegas
  const { data: bodegas, refetch: refetchBodegas } = useQuery({
    queryKey: ["bodegas"],
    queryFn: () => obtenerBodegasAction,
  });

  // Actualizar bodega existente
  const { mutate: mutateActualizarBodega } = useMutation({
    mutationFn: actualizarBodegaAction,

    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["bodegas"] });
      queryClient.invalidateQueries({ queryKey: ["bodegas", id] });
    },
  });

  // Eliminar bodega
  const { mutate: mutateEliminarBodega } = useMutation({
    mutationFn: (id: number) => eliminarBodegaAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodegas"] });
    },
  });

  // Obtener bodega por ID dinámico
  const { data: obtenerBodegasId, refetch: refetchBbtenerBodegasId } = useQuery(
    {
      queryKey: ["bodegas-id"],
      queryFn: async () => {
        // Primero obtener todas las bodegas, solo de debe de configurar una bodega, en cas de tener dos o mas, tomara el primero
        const codigoBodega = await obtenerBodegasAction();
        if (codigoBodega.length > 0) {
          // Luego obtener la bodega específica por el primer código disponible
          return await obtenerBodegasIdAction(
            Number(codigoBodega[0].CODIGO_BODEGA)
          );
        }
        throw new Error("No hay bodegas disponibles");
      },
    }
  );

  // Función para obtener bodega dinámicamente
  const ObtenerBodegasId2 = async () => {
    try {
      await refetchBbtenerBodegasId();
      return {
        obtenerBodegasId,
        refetchBobtenerBodegasId: refetchBbtenerBodegasId,
      };
    } catch (error) {
      console.error("Error en ObtenerBodegasId2:", error);
      return null;
    }
  };

  return {
    bodegas,
    refetchBodegas,
    mutateActualizarBodega,
    mutateEliminarBodega,
    obtenerBodegasId,
    refetchBbtenerBodegasId,
    ObtenerBodegasId2,
  };
};
