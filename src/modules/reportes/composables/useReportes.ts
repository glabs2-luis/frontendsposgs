import { useQuery, useQueryClient } from "@tanstack/vue-query"
import { obtenerTipoVendedor } from "@/modules/notas_credito/action/useNotaCreditoActions"

export const useReportes = () => {

  const useTipoVendedor = (clave: string) => {
    return useQuery({
      queryKey: ['vendedor-info', clave],       // incluye el parámetro
      queryFn: () => obtenerTipoVendedor(clave),
      enabled: false                        // solo si hay clave
    })
  }

  return { useTipoVendedor }
}