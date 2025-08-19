import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useTotalStore = defineStore("total", () => {
  const totalGeneral = ref(0);
  const totalItems = ref(0);
  const ultimoCambio = ref<number>(
    Number(localStorage.getItem("ultimoCambio") || 0)
  );

  // actualizar el total
  const setTotal = (nuevoTotal: number) => {
    totalGeneral.value = nuevoTotal;
  };

  // Actualizar la cantidad de items
  const setItems = (total: number) => {
    totalItems.value = total;
  }

  // Actualizar el último cambio
  const setUltimoCambio = (cambio: number) => {
    const valor = Number(cambio) || 0;
    ultimoCambio.value = valor;
    try {
      localStorage.setItem("ultimoCambio", String(valor));
    } catch (_) {}
  };

  // Resetear el total
  const resetStore = () => {
    totalGeneral.value = 0;
    totalItems.value = 0;
  };

  return {
    totalGeneral,
    setTotal,
    ultimoCambio,
    setUltimoCambio,
    resetStore,
    setItems,
    totalItems
  };
});
