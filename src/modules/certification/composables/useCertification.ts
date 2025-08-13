import {
  crearCertificacionNcAction,
  crearCertificationAction,
} from "../actions/certificationAction";
import {
  showErrorNotification,
  showConfirmationDialog,
} from "@/common/helper/notification";
import { useQuery, useQueryClient, useMutation } from "@tanstack/vue-query";

export const useCertification = () => {
  const queryClient = useQueryClient();

  const { mutate: mutateCertificar } = useMutation({
    mutationFn: crearCertificationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificar"] });
    },
    onError: (error: Error) => {
      showErrorNotification("Error al certificar factura", error.message);
    },
  });

  const { mutate: mutateCertificarNc } = useMutation({
    mutationFn: crearCertificacionNcAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificarNc"] });
    },
    onError: (error: Error) => {
      showErrorNotification(
        "Error al certificar nota de credito",
        error.message
      );
    },
  });

  return {
    mutateCertificar,
    mutateCertificarNc,
  };
};
