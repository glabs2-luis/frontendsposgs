import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { obtenerFacturasErroresAction } from "../actions/facturasPendientesAction";

export const useFacturasFel = () => {
  const queryClient = useQueryClient();

  const {
    data: facturasErrores,
    refetch: refetchFacturasErrores,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["facturas-pendientes"],
    queryFn: () => obtenerFacturasErroresAction(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: true, // Refetch al enfocar la ventana
  });

  return {
    facturasErrores,
    refetchFacturasErrores,
    isLoading,
    error,
  };
};
