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
          <q-card flat bordered class="q-pa-sm bg-white shadow-3">
            <div class="row items-center q-gutter-sm no-wrap">
              
              <!-- Número de Pedido -->
              <div v-if="mostrarNumPedido" class="row items-center q-gutter-xs">
                <q-icon name="receipt_long" color="primary" size="sm" />
                <div class="text-subtitle2 text-primary">
                  Pedido #{{ numPedido  }}
                </div>
              </div>

              <q-separator vertical class="q-mx-sm" />

              <!-- Total de Venta -->
              <div v-if="mostrarTotal" class="row items-center q-gutter-xs">
              <div class="row items-center q-gutter-xs total-card q-pa-xs">
                <q-icon name="paid" size="sm" class="text-amber-9" />
                <div>
                  <div v-if="mostrarTotal"  class="text-body1 text-amber-10 text-weight-bold">
                    Total{{ total }}
                  </div>
                </div>
              </div>
              </div>

                </div>
              </q-card>
            </div>

          <ModalEditarCliente
            :model-value="abrirModalCliente"
               @update:modelValue="abrirModalCliente = $event"
                :cliente="clienteTemp"
              modo="crear"
            @guardar="guardarClienteDesdeModal"/>

          </div>
      </div>

   </div>
</template>


<script setup lang="ts">

import { ref, computed } from 'vue'
import { QExpansionItem } from 'quasar'
import useClientes from '../../clientes/composables/use.clientes';
import { showErrorNotification, showSuccessNotification } from '@/common/helper/notification';
import ModalEditarCliente from '@/modals/modalEditarCliente.vue';
import type { Cliente } from '@/modules/clientes/interfaces/clientesInterface'
import usePedidosEnc from '@/modules/pedidos_enc/composables/use-pedidosEnc';
import { useUserStore } from '../../../stores/user';


const detallesPedido = ref (0)



const userStore = useUserStore();

const abrirModalCliente = ref(false)
const mostrarCardPedidoCreado = ref(false)
const expansion = ref<any>(null)
const { obtenerClientePorDocumento,refetchMostrarCF, mutateCrearCliente } = useClientes()
const { mutateCrearPedidoEnc, obtenerPedidoPorId } = usePedidosEnc()
const total = ref(0)
const numPedido = ref(0)

//mostrar total mayor a 0
const mostrarTotal = computed(() => total.value > 0)


const mostrarNumPedido = computed(() => numPedido.value > 0)

const cliente = ref({
  DOCUMENTO: '',
  NOMBRE: '',
  DIRECCION: '',
  TELEFONO: '',
  EMAIL: ''
})

//Llenar modal desde esta pagina
const clienteTemp = ref ({
  NIT: '',
  NOMBRE: '',
  DIRECCION: '',
  TELEFONO: '',
  CORREO_ELECTRONICO: ''
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
    TOTAL_GENERAL_PEDIDO: 97,        // temporal
    ID_SUCURSAL: 1,                // temporal
    USUARIO_INGRESO_PEDI: (userStore.nombreVendedor).substring(0,10) , 
    CODIGO_VENDEDOR: userStore.codigoVendedor ,          
    CODIGO_DE_CLIENTE: 1020      // temporal
  }

  console.log('Pedido a guardar:', JSON.stringify(pedidoEnc, null, 2));


    mutateCrearPedidoEnc(pedidoEnc, {
    onSuccess: (data) => {

      total.value=data.TOTAL_GENERAL_PEDIDO
      numPedido.value=data.NUMERO_DE_PEDIDO

      mostrarCardPedidoCreado.value = true;
      showSuccessNotification('Pedido creado', 'Pedido registrado correctamente');

      console.log('Pedido a guardar:', JSON.stringify(pedidoEnc, null, 2));
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
        EMAIL: clienteEncontrado.CORREO_ELECTRONICO || '',
        
      })

    expansion.value?.toggle()

      //crear pedido
      crearPedido()

    } else {
    clienteTemp.value.NIT = doc // prellenar el NIT buscado
   abrirModalCliente.value = true
  }

}


const usarF2 = (e: KeyboardEvent) => {
  if (e.key === 'F2') {
    e.preventDefault()
    colocarCF()
  }

}

const guardarClienteDesdeModal = (nuevoCliente: Cliente) => {
  const payload: Partial<Cliente> = { ...nuevoCliente }

  // Eliminar campos vacíos opcionales
  if (!payload.CORREO_ELECTRONICO || payload.CORREO_ELECTRONICO.trim() === '') {
    delete payload.CORREO_ELECTRONICO
  }

  // TELEFONO: debe ser string,
  if (!payload.TELEFONO || typeof payload.TELEFONO !== 'string') {
    payload.TELEFONO = ''
  }

  mutateCrearCliente(payload, {
    onSuccess: (creado: any) => {
      cliente.value = {
        DOCUMENTO: creado.DPI || creado.NIT || '',
        NOMBRE: creado.NOMBRE,
        DIRECCION: creado.DIRECCION,
        TELEFONO: creado.TELEFONO || '',
        EMAIL: creado.CORREO_ELECTRONICO || ''
      }

      abrirModalCliente.value = false
      expansion.value?.toggle()

      showSuccessNotification('Nuevo Cliente', 'Cliente creado satisfactoriamente')
    },
    onError: (error: any) => {
      console.error('Error creando cliente:', error)
      showErrorNotification('Error', error.message || 'No se pudo registrar el cliente')
    }
  })
}


</script>

<style scoped>

.total-card {
  background-color: #fff9db;
  border: 1px solid #ffecb3;
  border-radius: 8px;
  min-width: 130px;
  max-height: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

</style>