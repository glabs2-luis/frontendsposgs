import { ref, onMounted, onUnmounted } from "vue"

export function conexion() {
  
  const Online = ref<boolean>(navigator.onLine)

  const actualizarEstado = () => {
    Online.value = navigator.onLine
    console.log(`🔌 Estado de red: ${Online.value ? 'Conectado' : 'Sin conexión'}`)
  }

  onMounted(() => {
    window.addEventListener("online", actualizarEstado)
    window.addEventListener("offline", actualizarEstado)
  })

  onUnmounted(() => {
    window.removeEventListener("online", actualizarEstado)
    window.removeEventListener("offline", actualizarEstado)
  })

  return { Online }
}
