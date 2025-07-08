import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTotalStore = defineStore('total', () => {
    // estado reactivo
    const totalGeneral = ref(0)

    // accions actualizar total
    const setTotal = (nuevoTotal: number ) => {
        totalGeneral.value = nuevoTotal
    }

    return {
        totalGeneral,
        setTotal
    }

})
