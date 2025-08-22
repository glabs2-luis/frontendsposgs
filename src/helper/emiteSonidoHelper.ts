export function sonidoProceso(tipo: string = 'correcto'): void {
  // si es error, sonido agudo
  // si es exito, sonido grave
  const tipoSonido = tipo === 'error' ? 'sawtooth' : 'square';  // Tipo de onda, se usan: 'sine', 'square', 'triangle', 'sawtooth'
  const frecuencia = tipo === 'error' ? 440 : 880;              // Frecuencia en Hz (440 = nota La, 880 = una octava arriba)
  const tiempo =  tipo === 'error' ? 900 : 100;                // Duración en ms


  const ctx = new ((window.AudioContext || (window as any).webkitAudioContext))()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = tipoSonido
  oscillator.frequency.value = frecuencia  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start()

  // Detenemos el sonido después de 0.5 segundos
  setTimeout(() => {
    oscillator.stop()
    ctx.close()
  }, tiempo)
}