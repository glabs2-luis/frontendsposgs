import { Productos } from "../interfaces/productosInterface";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  obtenerProductosAction,
  obtenerProductosIdAction,
  ObtenerProductosPrecioAction,
} from "../action/productosAction";
import {
  showConfirmationDialog,
  showErrorNotification,
} from "@/common/helper/notification";
import { getAxiosErrorMessage } from "@/helper/geterrordb";

export const useProductos = () => {
  const queryClient = useQueryClient();

  //obtener todos los Productos
  const { data: todosProductos, refetch: refetchTodosProductos, isLoading: loadingProductos, isFetching: fetchingProductos, error: errorProductos } = useQuery({
    queryKey: ["productos"],
    queryFn: () => obtenerProductosAction(),
    staleTime: 1000 * 60 * 60, // 60 minutos
    refetchOnWindowFocus: false,
  });

  // obtener  productos por Id
  const obtenerProductosId = async (codigo: string) => {
    try {
      const producto = await obtenerProductosIdAction(codigo);
      return producto;
    } catch (error) {
      const message = getAxiosErrorMessage(error, "Error consultando producto");
      throw new Error(message);
    }
  };

  // Obtener precio del producto
  const precioReal = async (
    codigo: string,
    cantidad: number
  ): Promise<Productos> => {
    try {
      const productoPrecio = await ObtenerProductosPrecioAction(
        codigo,
        cantidad
      );
      //console.log('composable: ', productoPrecio)
      return productoPrecio;
    } catch (error) {
      const message = getAxiosErrorMessage(
        error,
        "Error obteniendo el precio del producto"
      );
      throw new Error(message);
    }
  };

  return {
    todosProductos,
    refetchTodosProductos,
    obtenerProductosId,
    precioReal,
    loadingProductos,
    fetchingProductos,
    errorProductos,
  };
};
