import { sonidoProceso } from "@/helper/emiteSonidoHelper";
import { Notify } from "quasar";
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

// Mensaje de confirmacion dentro de un modal
export const showConfirmationInsideModal2 = async (
  title: string,
  text?: string
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#4CAF50",
    cancelButtonColor: "Red",
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

// Loadings
export const showLoading = (message = 'Procesando…', insideModal = false) => {
  try {
    // Cerrar cualquier loading previo
    if (Swal.isVisible() && Swal.getIcon() === null && Swal.getTitle()?.textContent === message) {
      // Ya hay un loading con el mismo mensaje
      return;
    }

    Swal.fire({
      title: message,
      html: `
        <div style="display:flex;align-items:center;justify-content:center;gap:.75rem;">
          <div class="swal2-loader"></div>
          <span style="font-size:14px;opacity:.9;">Por favor, espera…</span>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      backdrop: true,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
        // Ajuste de z-index cuando se usa dentro de un modal propio
        if (insideModal) {
          const container = document.querySelector('.swal2-container') as HTMLElement;
          if (container) container.style.zIndex = '9999';
        }
      },
      willClose: () => {
        // Limpieza 
      },

      customClass: {
        popup: insideModal ? 'swal-popup-inside-modal' : ''
      }
    });
  } catch (err) {
    //console.error('showLoading error:', err);
  }
};

/**
 Cerrar el Loading
 */
export const hideLoading = () => {
  try {
    if (Swal.isVisible()) Swal.close();
  } catch (err) {
    //console.error('hideLoading error:', err);
  }
};

// Loading
export const runWithLoading = async <T>(
  fn: () => Promise<T>,
  message = 'Procesando…',
  insideModal = false
): Promise<T> => {
  showLoading(message, insideModal);
  try {
    return await fn();
  } finally {
    hideLoading();
  }
};


// Mensaje de exito con sonido
export const mostrarNotificacionCorrectoSonido = (text: string) => {
  sonidoProceso("correcto");
  
  Notify.create({
        type: "positive",
        message: text,
        position: "center",
        color: "green",
        timeout: 2000,
        group: false,
        progress: true,
        icon: "check",
      });
};

// Mensaje de error con sonido que no se cierra solo y debe cerrarse con el boton

export const mostrarNotificacionErrorSonido = (text: string): Promise<boolean> => {
  sonidoProceso("error");
  return new Promise((resolve, reject) => {
    Notify.create({
        type: "negative",
        message: text,
        position: "center",
        color: "red-12",
        timeout: 0,
        group: true,
        progress: true,
        icon: "error",
        actions: [
          {
            label: 'OK',
            color: 'white',
            handler: () => resolve(false)
          }
         
        ]
    });
  });
};
