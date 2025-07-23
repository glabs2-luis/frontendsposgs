<template>
  <q-dialog v-model="mostrar" @show="enfocarNombre">
    <q-card style="min-width: 500px; max-width: 90vw;">
      <q-card-section class="row items-center justify-between">
        <div class="titulo-modal"> {{  props.modo === 'crear' ? 'Crear Cliente ': 'Editar Cliente'}} </div>
        <q-btn flat icon="close" round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section>

        <q-form @submit.prevent="Guardar">
          <q-input ref="focusNombre" v-model="clienteForm.NOMBRE" label="Nombre" dense outlined :rules="[val => !!val || 'Requerido']" />
          <q-input v-model="clienteForm.DPI" label="DPI" dense outlined class="q-mb-md"/>
          <q-input v-model="clienteForm.NIT" label="NIT" dense outlined :rules="[val => !!val || 'Requerido']" />
          <q-input v-model="cliente.DIRECCION" label="Dirección" dense outlined  :rules="[val => !!val || 'Requerido']" />
          <q-input v-model="cliente.TELEFONO" label="Teléfono" dense outlined class="q-mb-md" mask="####-####" />
          <q-input v-model="cliente.CORREO_ELECTRONICO" label="Correo Electrónico" dense outlined class="q-mb-sm" type="email" />

          <q-btn class="boton-amarillo q-mt-md" :label="props.modo === 'crear' ? 'Crear' : 'Guardar'" type="submit" />
        </q-form>

      </q-card-section>
    </q-card>

  </q-dialog>

</template>

<script setup lang="ts">

import { Cliente } from '@/modules/clientes/interfaces/clientesInterface'
import { ref, watch, computed } from 'vue'
import { showSuccessNotification } from '@/common/helper/notification'
import { nextTick } from 'vue'

const focusNombre = ref()

const enfocarNombre = async () => {
  await nextTick()
  focusNombre.value?.focus()
}

const props = defineProps<{
  modelValue: boolean
  cliente: Cliente
  modo: 'editar' | 'crear'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'guardar', clienteActualizado: Cliente): void
}>()

// Modal interno 
const mostrar = ref(props.modelValue)
watch(() => props.modelValue, async val => {
  mostrar.value = val
  await nextTick()
  focusNombre.value?.focus() // Enfocar el campo de nombre al abrir el modal
})


watch(() => mostrar.value, val => {
  emit('update:modelValue', val)
})

// local
const cliente = ref<Cliente>({ ...props.cliente })
watch([() => props.modelValue, () => props.cliente], ([isOpen, nuevoCliente]) => {
  if (isOpen) {
    cliente.value = { ...nuevoCliente }
  }
})


const clienteForm = computed(() => cliente.value)

// Guardar cambios
function Guardar() {
  emit('guardar', cliente.value)
  emit('update:modelValue', false)
}

</script>

<style scoped>

.boton-amarillo {
  background: linear-gradient(90deg, 
#FFEB3B, 
#FBC02D);
  color: #333;
  font-weight: 500;
  display: block;
  text-align: center;
  margin: 16px auto 0;

  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.boton-amarillo:hover {
  background: linear-gradient(90deg, 
#FBC02D, 
#F9A825);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.titulo-modal {
  background-color: 
#FFF8E1; 
  padding: 10px 16px;
  font-size: 1.2rem;
  font-weight: 600;
  display: block;
  width: 90%;
  text-align: center;
  margin: 16px auto 0;
  color: #333;
  border-radius: 8px 8px 0 0;
  border-bottom: 3px solid 
#FFD54F;
  box-shadow: inset 0 -2px 0 rgba(255, 213, 79, 0.5);
}

</style>

