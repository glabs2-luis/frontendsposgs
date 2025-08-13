import { computed, type Ref } from "vue";
import { validationAction } from "../action/validationAction";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { Empresa } from "../../fel_empresa_establecimiento/interfaces/empresaInterface";

export const useValidation = (
  nit: string,
  tipo: string,
  validan: boolean,
  empresa: string
) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["Datos-Sat", nit],
    queryFn: () => validationAction(nit, tipo, validan, empresa),
    enabled: !!nit,
    retry: false,
  });

  // función simple para usar cuando quieras llamar directo
  const DatosSat2 = async (n: string, t: string, v: boolean, e: string) =>
   await validationAction(n, t, v, e);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    DatosSat2,
  };
};
