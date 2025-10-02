import { getConfigSonidoError, getConfigSonidoExito } from "@/stores/localStorage";


export function sonidoProceso(tipo: string = "correcto"): void {
  // si es error, sonido agudo
  // si es exito, sonido grave

  const configSonidoError = getConfigSonidoError();
  const configSonidoExito = getConfigSonidoExito();

  const tipoSonido = tipo === "error" ? "sawtooth" : "square"; // Tipo de onda, se usan: 'sine', 'square', 'triangle', 'sawtooth'
  const frecuencia = Number((tipo === "error" ? configSonidoError.Herzio : configSonidoExito.Herzio).toString()); // Frecuencia en Hz (440 = nota La, 880 = una octava arriba)
  const tiempo = Number((tipo === "error" ? configSonidoError.Tiempo : configSonidoExito.Tiempo).toString()); // Duración en ms

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  oscillator.type = tipoSonido;
  oscillator.frequency.value = frecuencia;
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();

  // Detenemos el sonido después de {tiempo} milisegundos
  setTimeout(() => {
    oscillator.stop();
    ctx.close();
  }, tiempo);
}
