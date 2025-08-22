import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { loginVendedorAction } from "@/modules/login/action/login-vendedor.action";
import axios from "axios";
import { useRouter } from "vue-router";

export const useUserStore = defineStore(
  "user",
  () => {
    const nombreVendedor = ref("");
    const codigoVendedor = ref<number | null>(null);
    const token = ref("");
    const tipoUsuario = ref('');

    const router = useRouter();

    const cerrarSesion = () => {
      nombreVendedor.value = "";
      codigoVendedor.value = null;
      token.value = "";
      tipoUsuario.value = '';
      localStorage.clear();
      delete axios.defaults.headers.common["Authorization"];
      router.push("/login");
    };

    // Obtenemos todo el objeto de la mutación
    const mutation = useMutation({
      mutationFn: loginVendedorAction,
      onSuccess(data) {
        nombreVendedor.value = data.NOMBRE_VENDEDOR || "";
        codigoVendedor.value = data.CODIGO_VENDEDOR || null;
        token.value = data.token || "";
        tipoUsuario.value = data.TIPO_USUARIO;

        localStorage.setItem("usuario", nombreVendedor.value);
        localStorage.setItem("codigo", String(codigoVendedor.value || ""));
        localStorage.setItem("token", token.value);
        localStorage.setItem("tipoUsuario", tipoUsuario.value)

        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token.value}`;
        router.push("/ventas");
      },
      onError(error) {
        cerrarSesion();
      },
    });
    // aplicar token a axios
    if (token.value) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }

    return {
      nombreVendedor,
      codigoVendedor,
      token,
      tipoUsuario,
      loginMutation: mutation.mutate,
      isLoading: computed(() => mutation.status.value === "pending"),
      cerrarSesion,
    };
  },
  {
    // persistencia automatica
    persist: true,
  }
);
