import { LocalStorage } from "quasar";

// GUARDAREMOS Y RECUPARAREMOS EL TAMAÑO DE LETRA PARA LA DESCRIPCIÓN, PRECIO Y SUBTOTAL
export const setTamanioLetra = (tamanio: number) => {
  LocalStorage.set("TamanioLetra", tamanio);
}
export const getTamanioLetra = (): string => {
  const tamanio = LocalStorage.getItem("amanioLetra").toLocaleString();
    // Si no hay valor guardado, retornamos un valor por defecto
  return tamanio || '16'; // Valor por defecto si no se encuentra
}