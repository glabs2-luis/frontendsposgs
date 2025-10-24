import { obtenerProductoExistencia, obtenerExistenciaBodega, obtenerLoteProducto, obtenerTokenAction } from '../action/existenciasAction';
import { useMutation, useQuery } from '@tanstack/vue-query';
import { computed, unref } from 'vue';

export const useProductosExistencias = (paramsBase) => {

        const baseParams = computed(() => {
        const params = unref(paramsBase);
        return {
            empresa: params.empresa,
            bodega: params.bodega,
            vendedor: params.vendedor,
            sucursal: params.sucursal
        };
    });

    const { data: existenciaProducto, error: errorExistencias, refetch: refetchExistenciaProducto } = useQuery({
        queryKey: ['existenciaProducto', baseParams],
        queryFn: () => obtenerProductoExistencia(baseParams.value),
        enabled: computed(() => {
            const params = baseParams.value;
            return !!(params.empresa && params.bodega && params.vendedor && params.sucursal);
        })
    });

    // Lotes de un producto específico
    const paramsLote = computed(() => {
        const params = unref(paramsBase);
        return {
            empresa: params.empresa,
            bodega: params.bodega,
            vendedor: params.vendedor,
            sucursal: params.sucursal,
            producto: params.producto
        };
    });

    const { data: loteProducto, refetch: refetchLoteProducto } = useQuery({
        queryKey: ['loteProducto', paramsLote],
        queryFn: () => obtenerLoteProducto(paramsLote.value),
        enabled: false
    });

    // Query para existencias en otras bodegas
    const paramsExistenciaBodega = computed(() => {
        const params = unref(paramsBase);
        return {
            empresa: params.empresa,
            bodega: params.bodega,
            vendedor: params.vendedor,
            sucursal: params.sucursal,
            producto: params.producto,
            lote: params.lote
        };
    });

    const { data: existenciaBodega, refetch:refetchExistenciasBodegas} = useQuery({
        queryKey: ['existenciaBodega', paramsExistenciaBodega],
        queryFn: () => obtenerExistenciaBodega(paramsExistenciaBodega.value),
        enabled: false
    });

    // Not in use now
    const { mutate: mutationToken } = useMutation({
      mutationFn: async () => await obtenerTokenAction(baseParams.value),
      onSuccess: (data) => {
        //console.log("Token obtenido desde useExistencias:", data);
      },
      onError: (error) => {
        //console.error(" Error obteniendo el token desde useExistencias:", error);
      },
    })

    const { 
        mutate: obtenerToken, 
        mutateAsync: obtenerTokenAsync,
        isPending: loadingToken,
        isError: errorToken,
        data: tokenData 
    } = useMutation({
        mutationFn: async () => {
            const data = await obtenerTokenAction(baseParams.value);
            return data;
        },
        onSuccess: (data) => {
            //console.log(" Token obtenido exitosamente!", data);
        },
        onError: (error) => {
            //console.error(" Detalles del error:", error.message);
        },
    });

    return {
        existenciaProducto,
        errorExistencias,
        refetchExistenciaProducto,
        loteProducto,
        refetchLoteProducto,
        existenciaBodega,
        refetchExistenciasBodegas,
        // Token
        obtenerToken,         
        obtenerTokenAsync,    
        loadingToken,
        errorToken,
        tokenData
    }

}