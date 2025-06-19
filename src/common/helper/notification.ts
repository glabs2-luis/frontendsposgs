import Swal from 'sweetalert2';

export const showSuccessNotification = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    draggable: true,
  });
};

export const showErrorNotification = (title: string, text: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
  });
};

export const showConfirmationDialog = async (
  title: string,
  text?: string,
  confirmButtonText = 'Sí',
  cancelButtonText = 'Cancelar',
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed;
};




