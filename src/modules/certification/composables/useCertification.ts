import { crearCertificationAction } from '../actions/certificationAction'
import { showErrorNotification, showConfirmationDialog } from '@/common/helper/notification'
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'

export const useCertification = () => {

const queryClient = useQueryClient()

const { mutate: mutateCertificar } = useMutation({
    mutationFn: crearCertificationAction,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['certificar']})
    }
})

return {
    mutateCertificar
}

}