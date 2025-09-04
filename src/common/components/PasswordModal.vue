<template>
  <q-dialog v-model="mostrarModal" persistent @keydown.esc="cancelar">
    <q-card style="width: 400px; height: 210px">
      <q-card-section class="q-pa-md q-pl-md q-ma-none title-card">
        <div class="text-h6 text-bold">
          <q-icon name="lock_open" /> {{ title }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-sm q-mt-none q-ml-md q-mr-md">
        <q-input
          v-model="password"
          :label="label"
          autofocus
          @keyup.enter="verificarPassword"
          @keyup.esc="cancelar"
          :type="mostrarPassword ? 'text' : 'password'"
        >
          <template #append>
            <q-icon
              :name="mostrarPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="mostrarPassword = !mostrarPassword"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="cancelLabel" @click="cancelar" color="black" />
        <q-btn
          :label="confirmLabel"
          class="boton-amarillo"
          icon-right="arrow_forward"
          @click="verificarPassword"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { showErrorNotificationInside } from "@/common/helper/notification";
import { obtenerTipoVendedor } from "@/modules/notas_credito/action/useNotaCreditoActions";
import { useQuasar } from "quasar";

const $q = useQuasar();
// Props
interface Props {
  title?: string;
  label?: string;
  cancelLabel?: string;
  confirmLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Autorización Requerida",
  label: "Ingrese la contraseña",
  cancelLabel: "Cancelar",
  confirmLabel: "Ingresar",
});

// Emits
const emit = defineEmits<{
  success: [];
  cancel: [];
}>();

// Estado del modal
const mostrarModal = ref(false);
const password = ref("");
const mostrarPassword = ref(false);

// Exponer métodos para el componente padre
const abrirModal = () => {
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  password.value = "";
  mostrarPassword.value = false;
};

// Verificar contraseña
const verificarPassword = async () => {
  try {
    const datos = await obtenerTipoVendedor(password.value);

    if (!datos || !datos.TIPO_VENDEDOR) {
      showErrorNotificationInside(
        "Contraseña incorrecta",
        "Verifique sus credenciales"
      );
      password.value = "";
      return;
    }

    if (
      datos.TIPO_VENDEDOR === "SA" ||
      datos.TIPO_VENDEDOR === "AD" ||
      datos.TIPO_VENDEDOR === "DE"
    ) {
      cerrarModal();
      emit("success");
    } else {
      showErrorNotificationInside(
        "Acceso No Autorizado",
        "Contacte a algun administrador"
      );
      password.value = "";
    }
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error",
      caption: error.message,
      progress: true,
      position: "top-right",
    });
    password.value = "";
  }
};

// Función para cancelar (se ejecuta con botón Cancelar o tecla Escape)
const cancelar = () => {
  cerrarModal();
  emit("cancel");
};

// Exponer al componente padre
defineExpose({
  abrirModal,
  cerrarModal,
});
</script>

<style scoped>
.title-card {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
  border-radius: 12px 12px 0 0;
}

.boton-amarillo {
  background: linear-gradient(135deg, #ffeb3b 0%, #fbc02d 100%);
  color: #2c3e50;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.boton-amarillo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 235, 59, 0.4);
}
</style>
