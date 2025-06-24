<template>
  <div class="row">
    <div class="col-12 col-md-8 col-lg-7">
      
      <q-expansion-item ref="expansion"
        icon="person" label="Información del Cliente" expand-separator default-opened header-class="bg-yellow-1 text-black" >

         <template #header>
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
          <q-item-section>
            <q-item-label>Información del Cliente</q-item-label>
              <q-item-label caption class="text-black text-weight-bold">
                {{ cliente.DOCUMENTO }} - {{ cliente.NOMBRE }} - {{ cliente.DIRECCION }}
              </q-item-label>
            </q-item-section>
          </template>

      <q-card flat bordered class="q-pa-xs bg-grey-1" style="border-radius: 6px;">
        <div class="q-pa-sm">
         
          <q-form>
            <div class="row q-col-gutter-xs">
              <!-- Fila 1: Documento, Nombre, Dirección -->
              <div class="col-4">
                <q-input v-model="cliente.DOCUMENTO" label="DPI/NIT" dense
                  outlined :rules="[val => !!val || 'Requerido']"
                  style="font-size: 13px;" @keydown.enter.prevent="buscarClienteDPINIT" @keydown="usarF2">
                
                  <template v-slot:append>
                    <q-btn flat dense icon="search"
                      color="primary" @click="buscarClienteDPINIT"
                      :disable="!cliente.DOCUMENTO" size="xs" />
                  </template>
                </q-input>
              </div>

              <div class="col-5">
                <q-input v-model="cliente.NOMBRE" label="Nombre"
                  dense outlined :rules="[val => !!val || 'Requerido']"
                  style="font-size: 13px;" />
              </div>

              <div class="col-3">
                <q-input
                  v-model="cliente.DIRECCION" label="Dirección" dense outlined
                  :rules="[val => !!val || 'Requerido']" style="font-size: 13px;" />
              </div>

              <!--Telefono - Cliente -->
              <div class="col-3">
                <q-input v-model="cliente.TELEFONO" label="Teléfono" dense
                  outlined mask="####-####" style="font-size: 13px;" />
              </div>

              <div class="col-6">
                <q-input v-model="cliente.EMAIL" label="Email"
                dense outlined type="email" style="font-size: 13px;" />
              </div>


              <!-- Consumidor Final-->
              <div class="col-3 flex items-end">
                <q-btn flat dense icon="person" color="warning"
                  label="CF (F2)" @click="colocarCF" size="md"
                  class="full-width" style="height: 32px;"  />
              </div>

            </div>
          </q-form>
        </div>
      </q-card>

      </q-expansion-item>

      <ModalEditarCliente
          :model-value="abrirModalCliente" @update:modelValue="abrirModalCliente = $event"
          :cliente="clienteParaModal" modo="crear" @guardar="guardarClienteDesdeModal" />
    </div>
  </div>

</template>

<script setup lang="ts">

import { ref, computed } from 'vue'
import { QExpansionItem } from 'quasar'
import useClientes from '../../clientes/composables/use.clientes';
import { showErrorNotification, showSuccessNotification } from '@/common/helper/notification';
import ModalEditarCliente from '@/modals/modalEditarCliente.vue';
import { crearClientesAction } from '@/modules/clientes/action/clientes-action';
import type { Cliente } from '@/modules/clientes/interfaces/clientesInterface'

const abrirModalCliente = ref(false)
const expansion = ref<any>(null)

const { obtenerClientePorDocumento, refetchMostrarCF } = useClientes()

const cliente = ref({
  DOCUMENTO: '',
  NOMBRE: '',
  DIRECCION: '',
  TELEFONO: '',
  EMAIL: ''
})

// Cliente para pasar al modal - prerellenado
const clienteParaModal = computed(() => {
  const doc = cliente.value.DOCUMENTO.trim()
  const tipo: 'dpi' | 'nit' = doc.length > 9 ? 'dpi' : 'nit'
  
  return {
    NOMBRE: '',
    DPI: tipo === 'dpi' ? doc : '',
    NIT: tipo === 'nit' ? doc : '',
    DIRECCION: '',
    TELEFONO: '',
    CORREO_ELECTRONICO: ''
  } as Cliente
})

// Funcion para Colocar CF
const colocarCF = async () => {
  const cf = await refetchMostrarCF()

  if (cf.data) {
    Object.assign(cliente.value, {
      DOCUMENTO: cf.data.NIT || '',
      NOMBRE: cf.data.NOMBRE || '',
      DIRECCION: cf.data.DIRECCION || '',
      TELEFONO: cf.data.TELEFONO || '',
      EMAIL: cf.data.CORREO_ELECTRONICO || ''
    })

    showSuccessNotification('CF cargado', 'Consumidor Final cargado con éxito')
    expansion.value?.toggle()
  }
}

const buscarClienteDPINIT = async () => {
    const doc = cliente.value.DOCUMENTO.trim()
    if(!doc) return 

    const tipo: 'dpi' | 'nit' = doc.length > 9 ? 'dpi' : 'nit'

    // Buscar cliente
    const clienteEncontrado = await obtenerClientePorDocumento(doc, tipo)

    if (clienteEncontrado) {
      Object.assign(cliente.value, {
        DOCUMENTO: clienteEncontrado.NIT || '',
        NOMBRE: clienteEncontrado.NOMBRE || '',
        DIRECCION: clienteEncontrado.DIRECCION || '',
        TELEFONO: clienteEncontrado.TELEFONO || '',
        EMAIL: clienteEncontrado.CORREO_ELECTRONICO || ''
      })

    showSuccessNotification('Cliente Encontrado', 'Encontrado con éxito')
    expansion.value?.toggle()

    } else {
      // Cliente no encontrado, abrir modal con el documento prellenado
      abrirModalCliente.value = true;
  }
}

const usarF2 = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    e.preventDefault()
    colocarCF()
  }
}

const guardarClienteDesdeModal = async (clienteRecibido: any) => {
  try {
    const creado = await crearClientesAction(clienteRecibido)

    if (creado) {
      // Actualizar el formulario principal
      cliente.value = {
        DOCUMENTO: creado.DPI || creado.NIT || '',
        NOMBRE: creado.NOMBRE,
        DIRECCION: creado.DIRECCION,
        TELEFONO: creado.TELEFONO,
        EMAIL: creado.CORREO_ELECTRONICO
      }

      expansion.value?.toggle()

      // Notificación visual
      showSuccessNotification('Nuevo Cliente','Cliente Creado satisfactoriamente')
    }
  } catch (error) {
    const message = error
    throw new Error(message);
   // showErrorNotification('Error', 'No se puede crear el cliente')
  }
}

</script>