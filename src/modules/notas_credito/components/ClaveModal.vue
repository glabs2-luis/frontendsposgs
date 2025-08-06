<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 350px; max-width: 450px;">
      <q-card-section class="bg-primary text-white q-py-md">
        <div class="text-h6 text-center text-weight-bold">
          <q-icon name="lock_open" class="q-mr-sm" size="md" />Acceso a Notas de Crédito
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md q-pt-lg q-gutter-md">
        <q-input
          v-model="clave"
          :type="passwordFieldType"
          label="Clave de acceso"
          outlined
          dense
          autofocus
          hide-details="auto"
          :rules="[val => !!val || 'La clave es obligatoria']"
          @keyup.enter="aceptar"
          ref="claveInputRef"
        >
          <template v-slot:prepend>
            <q-icon name="vpn_key" />
          </template>
          <template v-slot:append>
            <q-btn
              flat
              dense
              round
              :icon="passwordFieldType === 'password' ? 'visibility_off' : 'visibility'"
              @click="togglePasswordVisibility"
            />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-8"
          @click="cerrar"
          class="q-px-md"
        />
        <q-btn
          color="primary"
          label="Ingresar"
          icon-right="arrow_forward"
          @click="aceptar"
          :disable="!clave"
          class="q-px-md"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar, QInput } from 'quasar';
import { obtenerTipoVendedor } from '@/modules/notas_credito/action/useNotaCreditoActions';
import type { Vendedor } from '@/modules/notas_credito/interfaces/NotaCredito'

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void;
  (e: 'aceptar', payload: { clave: string; vendedor: Vendedor }): void;
}>();

const $q = useQuasar();

const visible = ref(props.modelValue);
const clave = ref('');
const passwordFieldType = ref<'password' | 'text'>('password');
const claveInputRef = ref<QInput | null>(null);

watch(() => props.modelValue, val => {
  visible.value = val;
  if (!val) {
    clave.value = '';
  }
});

watch(visible, val => emit('update:modelValue', val));

function togglePasswordVisibility() {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
}

async function aceptar() {
  try {
    if (!clave.value) {
      $q.notify({
        type: 'warning',
        message: 'Por favor, ingrese la clave.',
        position: 'top',
        timeout: 3000
      });
      return;
    }

    const vendedor: Vendedor | null = await obtenerTipoVendedor(clave.value);

    if (!vendedor) {
      $q.notify({
        type: 'negative',
        message: 'Vendedor no encontrado.',
        position: 'top',
        timeout: 3000
      });
      claveInputRef.value?.select();
      return;
    }

    if (!['AD', 'DE', 'SA'].includes(vendedor.TIPO_VENDEDOR)) {
      $q.notify({
        type: 'warning',
        message: 'El usuario no tiene permisos para generar notas de credito.',
        position: 'top',
        timeout: 3000
      });
      claveInputRef.value?.select();
      return;
    }

    emit('aceptar', { clave: clave.value, vendedor: vendedor });
    visible.value = false;

  } catch (error) {
    console.log("Error en la funcion aceptar:", error);
    
    $q.notify({
      type: 'negative',
      message: 'Hubo un error al obtener el vendedor. Por favor, intente nuevamente más tarde.',
      position: 'top',
      timeout: 3000
    });
    claveInputRef.value?.select();
  }
}

function cerrar() {
  visible.value = false;
  clave.value = '';
  passwordFieldType.value = 'password';
}

</script>

<style scoped>
.q-card {
  border-radius: 8px;
}
</style>
