import { useQueryClient, useQuery } from "@tanstack/vue-query"
import { configuracionPosAction } from "../action/configuracionPosAction"


export const useConfiguracionPos = () => {
    
  const queryClient = useQueryClient();

    const { data: obtenerConfiguracionPos, refetch: refetchObtenerConfiguracionPos } = useQuery({
        queryKey: ['configuracion-Pos'],
        queryFn: () => configuracionPosAction()
    }
)

    return {
        obtenerConfiguracionPos,
        refetchObtenerConfiguracionPos
    }

}