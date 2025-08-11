import Swal from "sweetalert2";

// Mensaje de exito
export const showSuccessNotification = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    draggable: true,
    confirmButtonText: "OK",
    focusConfirm: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      const btn = Swal.getConfirmButton();
      btn?.focus();
    },
  });
};

// Mensaje de error
export const showErrorNotification = (title: string, text: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
    focusConfirm: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      const btn = Swal.getConfirmButton();
      btn?.focus();
    },
  });
};

// Mensaje de exito dentro de un Modal
export const showSuccessNotificationInside = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    draggable: true,
    heightAuto: false,
    confirmButtonText: "OK",
    focusConfirm: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "swal-popup-inside-modal",
    },
    didOpen: () => {
      const btn = Swal.getConfirmButton();
      btn?.focus();
      const container = document.querySelector(
        ".swal2-container"
      ) as HTMLElement;
      if (container) container.style.zIndex = "9999";
    },
  });
};

// Mensaje de rror dentro de un Modal
export const showErrorNotificationInside = (title: string, text: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    heightAuto: false,
    confirmButtonText: "OK",
    focusConfirm: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: "swal-popup-inside-modal",
    },
    didOpen: () => {
      const btn = Swal.getConfirmButton();
      btn?.focus();
      const container = document.querySelector(
        ".swal2-container"
      ) as HTMLElement;
      if (container) container.style.zIndex = "9999";
    },
  });
};

// MMensaje de confirmacion
export const showConfirmationDialog = async (
  title: string,
  text?: string,
  confirmButtonText = "Sí",
  cancelButtonText = "Cancelar"
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText,
    cancelButtonText,
    focusConfirm: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      const btn = Swal.getConfirmButton();
      btn?.focus();
    },
  });

  return result.isConfirmed;
};

// Mensaje de confirmacion dentro de un modal
export const showConfirmationInsideModal = async (
  title: string,
  text?: string
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "swal-popup-inside-modal",
    },
    heightAuto: false,
    focusConfirm: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      const btn = Swal.getConfirmButton();
      btn?.focus();
      const container = document.querySelector(
        ".swal2-container"
      ) as HTMLElement;
      if (container) container.style.zIndex = "9999";
    },
  });

  return result.isConfirmed;
};
