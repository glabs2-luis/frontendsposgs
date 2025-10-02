import { LocalStorage } from "quasar";

interface ConfiguracionSonidoError {
  Herzio: number;
  Tiempo: number;
}

interface ConfiguracionSonidoExito {
  Herzio: number;
  Tiempo: number;
}

// GUARDAREMOS Y RECUPARAREMOS EL TAMAÑO DE LETRA PARA LA DESCRIPCIÓN, PRECIO Y SUBTOTAL
export const setTamanioLetra = (tamanio: number) => {
  LocalStorage.set("TamanioLetra", tamanio);
}
export const getTamanioLetra = (): string => {
  const tamanio = LocalStorage.getItem("TamanioLetra").toLocaleString();
    // Si no hay valor guardado, retornamos un valor por defecto
  return tamanio || '16'; // Valor por defecto si no se encuentra
}

// GUARDAREMOS Y RECUPARAREMOS EL HERZIO PARA EL SONIDO DE ERROR
export const setConfigSonidoError = (config: ConfiguracionSonidoError) => {
  LocalStorage.set("ConfigSonidoError", config);
}
export const getConfigSonidoError = (): ConfiguracionSonidoError => {
  let confiSon: ConfiguracionSonidoError = { Herzio: 440, Tiempo: 400 };
  const configGuardada = LocalStorage.getItem("ConfigSonidoError") as ConfiguracionSonidoExito;
  // Si no hay valor guardado, retornamos un valor por defecto
  if (configGuardada) {
    confiSon.Herzio = configGuardada.Herzio;
    confiSon.Tiempo = configGuardada.Tiempo;
  }
  return confiSon;
}
export const eliminarConfigSonidoError = () => {
  LocalStorage.remove("ConfigSonidoError");
}

// GUARDAREMOS Y RECUPARAREMOS EL HERZIO PARA EL SONIDO DE EXITO
export const setConfigSonidoExito = (config: ConfiguracionSonidoExito) => {
  LocalStorage.set("ConfigSonidoExito", config);
}
export const getConfigSonidoExito = (): ConfiguracionSonidoExito => {
  let confiSon: ConfiguracionSonidoExito = { Herzio: 600, Tiempo: 50 };
  const configGuardada = LocalStorage.getItem("ConfigSonidoExito") as ConfiguracionSonidoExito;
  // Si no hay valor guardado, retornamos un valor por defecto
  if (configGuardada) {
    confiSon.Herzio = configGuardada.Herzio;
    confiSon.Tiempo = configGuardada.Tiempo;
  }
  return confiSon;
}
export const eliminarConfigSonidoExito = () => {
  LocalStorage.remove("ConfigSonidoExito");
}