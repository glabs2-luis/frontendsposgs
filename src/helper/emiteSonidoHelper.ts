import { getConfigSonidoError, getConfigSonidoExito } from "@/stores/localStorage";

let audioContext = null
let currentOscillator = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

export function sonidoProceso(tipo: string = "correcto"): void {
  // si es error, sonido agudo
  // si es exito, sonido grave

  const configSonidoError = getConfigSonidoError();
  const configSonidoExito = getConfigSonidoExito();

  const ctx = getAudioContext()

  // 🔇 Cortar el pitido anterior
  if (currentOscillator) {
    try {
      currentOscillator.stop()
    } catch (_) {}
    currentOscillator.disconnect()
    currentOscillator = null
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  const tipoSonido = tipo === "error" ? "square" : "square"; // Tipo de onda, se usan: 'sine', 'square', 'triangle', 'sawtooth'
  const frecuencia = Number((tipo === "error" ? configSonidoError.Herzio : configSonidoExito.Herzio).toString()); // Frecuencia en Hz (440 = nota La, 880 = una octava arriba)
  const tiempo = Number((tipo === "error" ? configSonidoError.Tiempo : configSonidoExito.Tiempo).toString()); // Duración en ms


  oscillator.type = tipoSonido;
  oscillator.frequency.value = frecuencia;

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + tiempo / 1000)

  currentOscillator = oscillator

  // Limpieza automática
  oscillator.onended = () => {
    if (currentOscillator === oscillator) {
      currentOscillator = null
    }
  }
}
