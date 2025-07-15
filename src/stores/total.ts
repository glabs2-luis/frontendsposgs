import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTotalStore = defineStore('total', () => {

    const totalGeneral = ref(0)

    // actualizar el total
    const setTotal = (nuevoTotal: number ) => {
        totalGeneral.value = nuevoTotal
    }

    // Resetear el total
    const resetStore = () => {
    totalGeneral.value = 0
  }

    return {
        totalGeneral,
        setTotal,
        resetStore
    }

})
