<template>
  <div class="row">
    <div class="col-12 col-md-8 col-lg-7">
      
      <q-expansion-item ref="expansion"
        icon="person" label="Información del Cliente"
        
        expand-separator
        default-opened header-class="bg-yellow-1 text-black" >

         <template #header>
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
          <q-item-section>
            <q-item-label>Información del Cliente</q-item-label>
              <q-item-label caption class="text-black text-weight-bold">
                {{ cliente.documento }} - {{ cliente.nombre }} - {{ cliente.direccion }}
              </q-item-label>
            </q-item-section>
          </template>

      <q-card flat bordered class="q-pa-xs bg-grey-1" style="border-radius: 6px;">
        <div class="q-pa-sm">
         
          <q-form>
            <div class="row q-col-gutter-xs">
              <!-- Fila 1: Documento, Nombre, Dirección -->
              <div class="col-4">
                <q-input v-model="cliente.documento" label="DPI/NIT" dense
                  outlined :rules="[val => ! !val || 'Requerido']"
                  style="font-size: 13px;" @keydown.enter.prevent="buscarClienteDPINIT" @keydown="usarF2">
                
                  <template v-slot:append>
                    <q-btn flat dense icon="search"
                      color="primary" @click="buscarClienteDPINIT"
                      :disable="!cliente.documento" size="xs" />
                  </template>
                </q-input>
              </div>

              <div class="col-5">
                <q-input v-model="cliente.nombre" label="Nombre"
                  dense outlined :rules="[val => !!val || 'Requerido']"
                  style="font-size: 13px;" />
              </div>

              <div class="col-3">
                <q-input
                  v-model="cliente.direccion" label="Dirección" dense outlined
                  :rules="[val => !!val || 'Requerido']" style="font-size: 13px;" />
              </div>

              <!-- Fila 2: Teléfono, Email, Botón CF -->
              <div class="col-3">
                <q-input v-model="cliente.telefono" label="Teléfono" dense
                  outlined mask="####-####" style="font-size: 13px;" />
              </div>

              <div class="col-6">
                <q-input v-model="cliente.email" label="Email"
                dense outlined type="email" style="font-size: 13px;" />
              </div>

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

    </div>
  </div>



</template>

<script setup lang="ts">

import { ref } from 'vue'
import { QExpansionItem } from 'quasar'
import useClientes from '../../clientes/composables/use.clientes';
import { showSuccessNotification } from '@/common/helper/notification';
import ModalEditarCliente from '@/modals/modalEditarCliente.vue';

const abrirModalCliente = ref('false')


const expansion = ref<any>(null)

const { obtenerClientePorDocumento,refetchMostrarCF } = useClientes()


const cliente = ref({
  documento: '',
  nombre: '',
  direccion: '',
  telefono: '',
  email: ''
})


const clienteNuevo = ref({
  NOMBRE: '',
  NIT: '',
  DPI: '',
  DIRECCION: '',
  TELEFONO: '',
  CORREO_ELECTRONICO: ''
})


const colocarCF = async () => {
  const cf = await refetchMostrarCF()

  if (cf.data) {
    Object.assign(cliente.value, {
      documento: cf.data.NIT || '',
      nombre: cf.data.NOMBRE || '',
      direccion: cf.data.DIRECCION || '',
      telefono: cf.data.TELEFONO || '',
      email: cf.data.CORREO_ELECTRONICO || ''
    })

    showSuccessNotification('CF cargado', 'Consumidor Final cargado con éxito')
    expansion.value?.collapse()
  }
}


const buscarClienteDPINIT = async () => {
    const doc = cliente.value.documento.trim()
    if(!doc) return 

    const tipo: 'dpi' | 'nit' = doc.length > 9 ? 'dpi' : 'nit'

    // Buscar cliente
    const clienteEncontrado = await obtenerClientePorDocumento(doc, tipo)


    if (clienteEncontrado) {
      Object.assign(cliente.value, {
        documento: clienteEncontrado.NIT || '',
        nombre: clienteEncontrado.NOMBRE || '',
        direccion: clienteEncontrado.DIRECCION || '',
        telefono: clienteEncontrado.TELEFONO || '',
        email: clienteEncontrado.CORREO_ELECTRONICO || ''
      })

    showSuccessNotification('Cliente Encontrado', 'Encontrado con éxito')
    expansion.value?.collapse()

    } else {


  }


    
}





// refetch Mostrar CF


const usarF2 = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    e.preventDefault()
    colocarCF()
  }

}

</script>