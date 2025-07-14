import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfiguracionStore = defineStore('configuracion', ()=> {
    
    const serieSeleccionada = ref<string>('')

    const setSerieSeleccionada = (serie: string) => {
        serieSeleccionada.value = serie
    }

    return {
        serieSeleccionada,
        setSerieSeleccionada
    }

}, { persist: true}

)

