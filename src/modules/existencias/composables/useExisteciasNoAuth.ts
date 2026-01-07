import { obtenerProductoExistenciaCodigoAction } from "@/modules/existencias/action/existenciasNoAuthAction";
import { useQuery } from "@tanstack/vue-query";
import { computed, unref } from "vue";

export const useProductosExistenciasDirect = (paramsBase) => {

        const baseParams = computed(() => {
        const params = unref(paramsBase);
        return {
            empresa: params.empresa,
            bodega: params.bodega,
            vendedor: params.vendedor,
            sucursal: params.sucursal,
            producto: params.producto
        }
});

    const { data: existenciaProductoDirect, error: errorExistenciasDirect, refetch: refetchExistenciaProductoDirect } = useQuery({
        queryKey: ['existenciaProducto', baseParams],
        queryFn: () => obtenerProductoExistenciaCodigoAction(baseParams.value),
        enabled: computed(() => {
            const params = baseParams.value;
            return !!(params.empresa && params.bodega && params.vendedor && params.sucursal && params.producto);
        })
    });


    return {
        existenciaProductoDirect,
        errorExistenciasDirect,
        refetchExistenciaProductoDirect
    }


}