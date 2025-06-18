import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStoreSucursal = defineStore('bodegas', () => {

    const codigoBodega = ref<string | null>(null)
    const descripcionBodega = ref<string | null>(null)
    const idSucursal = ref <string | null>(null)

      // actions
    const setbodega = (codigo: string, descripcion: string, id: string) => {
        codigoBodega.value = codigo
        descripcionBodega.value = descripcion
        idSucursal.value = id
    }

    // limpiar bodega
    const clearBodega = () => {
        codigoBodega.value = null
        descripcionBodega.value = null
        idSucursal.value = null
    }

    return {
        codigoBodega,
        descripcionBodega,
        idSucursal,
        setbodega,
        clearBodega
    }

}, {persist: true})