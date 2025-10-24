import { defineStore } from "pinia";
import { ref } from "vue";

export const useStoreTokenExistencia = defineStore('tokenExistencia', () => {

    const tokenExistencia = ref<string | null>(null);

  const setTokenExistencia = (token: string) => {
    tokenExistencia.value = token;
  }

    return {
        setTokenExistencia,
        tokenExistencia
    }

}, {persist: true});