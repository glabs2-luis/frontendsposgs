import { FacturaEnc } from "../interfaces/facturaEncInterface";
import {
  obtenerFacturasEncAction,
  obtenerFacturasEncIdAction,
  obtenerDetalleFacturaPorIdAction,
  crearFacturaEncAction,
  crearFacturaEncAction2,
  obtenerDatosFelAction,
  obtenerFacturasFechaAction,
  obtenerFacturaNumeroSerieAction
} from "../action/facturasEncAction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { showErrorNotification } from "@/common/helper/notification";

export const useFacturasEnc = () => {
  const queryClient = useQueryClient();

  const obtenerFacturasEnc = () => {
    return useQuery({
      queryKey: ["facturas-enc"],
      queryFn: () => obtenerFacturasEncAction(),
    });
  };

  const obtenerFacturaPorId = async (id: number) =>
    useQuery({
      queryKey: ["facturas-enc", id],
      queryFn: () => obtenerFacturasEncIdAction(id),
      enabled: false,
    });

  // obteniendo datos de la factura para imprimir
  const obtenerFacturaId3 = async (id: number) => {
    return await obtenerFacturasEncIdAction(id);
  };

  const obtenerDetalleFactura2 = (idFacturaEnc: number) => {
    return useQuery({
      queryKey: ["facturas-enc-detalle", idFacturaEnc],
      queryFn: () => obtenerDetalleFacturaPorIdAction(idFacturaEnc),
      enabled: !!idFacturaEnc,
    });
  };

  // Función normal para obtener el detalle de una factura por ID (sin useQuery)
  const obtenerDetalleFactura = async (idFacturaEnc: number) => {
    return await obtenerDetalleFacturaPorIdAction(idFacturaEnc);
  };

  //obtener datos Fel
  const obtenerDatosFel = async (numero: number) => {
    return await obtenerDatosFelAction(numero);
  };

  //crear factura
  const { mutate: mutateCrearFacturaEnc } = useMutation({
    mutationFn: crearFacturaEncAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas-enc"] });
    },
    onError: (error: Error) => {
      showErrorNotification("Error", error.message);
    },
  });

  // This en uso
  const { mutate: mutateCrearFacturaEnc2 } = useMutation({
    mutationFn: crearFacturaEncAction2,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facturas-enc"] });
    },
    onError: (error: Error) => {
      showErrorNotification("Error", error.message);
    },
  });

  const obtenerFacturasPorFecha = async (
    fecha_inicial: Date,
    fecha_final: Date,
    serie: string
  ) => {
    return await obtenerFacturasFechaAction(fecha_inicial, fecha_final, serie);
  };

  const obtenerFacturasPorNumeroSerie = async (
    numero: number,
    serie: string,
  ) => {
    return await obtenerFacturaNumeroSerieAction(serie, numero);
  }

  return {
    obtenerFacturasEnc,
    obtenerDetalleFactura,
    mutateCrearFacturaEnc,
    mutateCrearFacturaEnc2,
    obtenerFacturaPorId,
    obtenerFacturaId3,
    obtenerDatosFel,
    obtenerFacturasPorFecha,
    obtenerFacturasPorNumeroSerie
  };
};

export default useFacturasEnc;
