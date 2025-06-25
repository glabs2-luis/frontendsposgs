<template>
  <div class="row">
    <div class="col-12 col-md-8 col-lg-7">
      

      <div class="row items-start">

        <!-- ExpansionItem -->
        <div class="col">
          <q-expansion-item ref="expansion" icon="person" label="Información del Cliente" expand-separator default-opened header-class="bg-yellow-1 text-black" >
         
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
                    <div class="col-4">
                      <q-input v-model="cliente.DOCUMENTO" label="DPI/NIT" dense outlined :rules="[val => !!val || 'Requerido']"
                        style="font-size: 13px;" @keydown.enter.prevent="buscarClienteDPINIT" @keydown="usarF2">
                      
                        <template v-slot:append>
                          <q-btn flat dense icon="search" color="primary"
                            @click="buscarClienteDPINIT" :disable="!cliente.DOCUMENTO" size="xs" />
                          
                        </template>

                      </q-input>
                    </div>

                    <div class="col-5">
                      <q-input
                        v-model="cliente.NOMBRE"
                        label="Nombre"
                        dense
                        outlined
                        :rules="[val => !!val || 'Requerido']"
                        style="font-size: 13px;"
                      />
                    </div>

                    <div class="col-3">
                      <q-input
                        v-model="cliente.DIRECCION"
                        label="Dirección"
                        dense
                        outlined
                        :rules="[val => !!val || 'Requerido']"
                        style="font-size: 13px;"
                      />
                    </div>

                    <div class="col-3">
                      <q-input v-model="cliente.TELEFONO" label="Teléfono" dense outlined mask="####-####" style="font-size: 13px;"   />
                    
                    </div>

                    <div class="col-6">
                      <q-input v-model="cliente.EMAIL" label="Email" dense outlined type="email" style="font-size: 13px;" />
                      
                    </div>

                    <div class="col-3 flex items-end">
                      <q-btn flat dense icon="person" color="warning" label="CF (F2)" @click="colocarCF" size="md" class="full-width" style="height: 32px;" />
                     </div>

                  </div>
                </q-form>
              </div>
            </q-card>

          </q-expansion-item>
        </div>

        <!-- Botones al lado derecho -->
<div class="col-auto q-ml-sm q-mt-sm">
  <q-card flat bordered class="q-pa-sm bg-white rounded-borders shadow-3">
    <div class="row items-center q-gutter-sm no-wrap">
      
      <!-- Número de Pedido -->
      <div class="row items-center q-gutter-xs">
        <q-icon name="receipt_long" color="primary" size="sm" />
        <div class="text-subtitle2 text-primary">
          Pedido #{{  }}
        </div>
      </div>

      <q-separator vertical class="q-mx-sm" />

      <!-- Total de Venta -->
      <div class="row items-center q-gutter-xs">
        <q-icon name="paid" color="green-9" size="sm" />
        <div>
          <div class="text-h6 text-weight-bold text-green-9">
            Q{{ }}
          </div>
          <div class="text-caption text-grey-7">Total</div>
        </div>
      </div>

    </div>
  </q-card>
</div>


      
      <!-- Pedido -->
          

      <!-- pedidos_enc -->
      <q-card
        v-if="mostrarCardPedidoCreado"
        flat
        bordered
        class="q-mt-md bg-green-1 text-green-10"
      >
        <q-card-section>
          <div>Pedido registrado con éxito</div>
        </q-card-section>
      </q-card>

      <!-- Modal Cliente (si decides activarlo) -->
      <!--
      <ModalEditarCliente
        :model-value="abrirModalCliente"
        @update:modelValue="abrirModalCliente = $event"
        :cliente="cliente.value"
        modo="crear"
        @guardar="guardarClienteDesdeModal"
      />
      -->

          </div>
      </div>

   </div>
</template>


<script setup lang="ts">

import { ref } from 'vue'
import { QExpansionItem } from 'quasar'
import useClientes from '../../clientes/composables/use.clientes';
import { showErrorNotification, showSuccessNotification } from '@/common/helper/notification';
import ModalEditarCliente from '@/modals/modalEditarCliente.vue';
import { crearClientesAction } from '@/modules/clientes/action/clientes-action';
import type { Cliente } from '@/modules/clientes/interfaces/clientesInterface'
import usePedidosEnc from '@/modules/pedidos_enc/composables/use-pedidosEnc';

const abrirModalCliente = ref(false)
const mostrarCardPedidoCreado = ref(false)
const expansion = ref<any>(null)
const { obtenerClientePorDocumento,refetchMostrarCF } = useClientes()
const { mutateCrearPedidoEnc, obtenerPedidoPorId } = usePedidosEnc()
const total = ref(0)
const numPedido = ref(0)

const cliente = ref({
  DOCUMENTO: '',
  NOMBRE: '',
  DIRECCION: '',
  TELEFONO: '',
  EMAIL: ''
})



const crearPedido = () => {
  const nombre = cliente.value.NOMBRE?.trim();
  const direccion = cliente.value.DIRECCION?.trim();
  const nit = cliente.value.DOCUMENTO?.trim();

  if (!nombre || !direccion || !nit) {
    showErrorNotification('Datos incompletos', 'Debe seleccionar un cliente válido antes de crear el pedido');
    return;
  }

  const pedidoEnc = {
    NOMBRE_A_FACTURAR: nombre,
    DIRECCION_FACTURAR: direccion,
    NIT_A_FACTURAR: nit,
    SUBTOTAL_PEDIDO: 85,              // temporal
    IVA_PEDIDO: 12,                   // temporal
    TOTAL_GENERAL_PEDIDO: 97,        // temporal
    ID_SUCURSAL: 1,                // temporal
    USUARIO_INGRESO_PEDI: 'jpablo', // temporal
    CODIGO_VENDEDOR: 1,             // temporal
    CODIGO_DE_CLIENTE: 1020         // temporal
  }

  console.log('🚀 Pedido a guardar:', JSON.stringify(pedidoEnc, null, 2));


    mutateCrearPedidoEnc(pedidoEnc, {
    onSuccess: () => {


      mostrarCardPedidoCreado.value = true;
      showSuccessNotification('Pedido creado', 'Pedido registrado correctamente');

      console.log('🚀 Pedido a guardar:', JSON.stringify(pedidoEnc, null, 2));
    },
    onError: (error: any) => {
      showErrorNotification('Error al crear', error.message || 'No se pudo registrar el pedido');
    }
  });
}


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

    crearPedido()




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

      //crear pedido
      crearPedido()



    } else {
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
    showErrorNotification('Error', 'No se puede crear el cliente')
  }
}



</script>