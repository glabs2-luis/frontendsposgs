import { FacturaEnc } from "../interfaces/facturaEncInterface"
import { obtenerFacturasEncAction, obtenerFacturasEncIdAction, obtenerDetalleFacturaPorIdAction, crearFacturaEncAction, crearFacturaEncAction2 } from '../action/facturasEncAction'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { showConfirmationDialog } from '@/common/helper/notification'
import{ Ref } from 'vue'

export const useFacturasEnc = () => {

    const queryClient = useQueryClient()

const obtenerFacturasEnc = () => {
    return useQuery({
        queryKey: ['facturas-enc'],
        queryFn: () => obtenerFacturasEncAction()
    })
}

const obtenerDetalleFactura2 = (idFacturaEnc: number) => {
    return useQuery({
        queryKey: ['facturas-enc-detalle', idFacturaEnc],
        queryFn: () => obtenerDetalleFacturaPorIdAction(idFacturaEnc),
        enabled: !!idFacturaEnc
    })
}

  // Función normal para obtener el detalle de una factura por ID (sin useQuery)
  const obtenerDetalleFactura = async (idFacturaEnc: number) => {
    return await obtenerDetalleFacturaPorIdAction(idFacturaEnc)
  }

  //crear factura
  const { mutate: mutateCrearFacturaEnc } = useMutation({
    mutationFn: crearFacturaEncAction,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['facturas-enc']})
    }
  })

    const { mutate: mutateCrearFacturaEnc2 } = useMutation({
    mutationFn: crearFacturaEncAction2,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['facturas-enc']})
    }
  })



return {
    obtenerFacturasEnc,
    obtenerDetalleFactura,
    mutateCrearFacturaEnc,
    mutateCrearFacturaEnc2
}

}

export default useFacturasEnc