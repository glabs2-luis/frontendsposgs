<template>
  <div class="row">
    <div class="col-12 col-md-8 col-lg-7">
      <q-card flat bordered class="q-pa-xs bg-grey-1" style="border-radius: 6px;">
        <div class="q-pa-sm">
          <div class="text-body2 text-weight-medium q-mb-xs">Información del Cliente</div>
          
          <q-form>
            <div class="row q-col-gutter-xs">
              <!-- Fila 1: Documento, Nombre, Dirección -->
              <div class="col-4">
                <q-input
                  v-model="cliente.documento"
                  label="DPI/NIT"
                  dense
                  outlined
                  :rules="[val => !!val || 'Requerido']"
                  style="font-size: 13px;"
                >
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      icon="search"
                      color="primary"
                      @click="buscarCliente"
                      :disable="!cliente.documento"
                      size="xs"
                    />
                  </template>
                </q-input>
              </div>

              <div class="col-5">
                <q-input
                  v-model="cliente.nombre"
                  label="Nombre"
                  dense
                  outlined
                  :rules="[val => !!val || 'Requerido']"
                  style="font-size: 13px;"
                />
              </div>

              <div class="col-3">
                <q-input
                  v-model="cliente.direccion"
                  label="Dirección"
                  dense
                  outlined
                  :rules="[val => !!val || 'Requerido']"
                  style="font-size: 13px;"
                />
              </div>

              <!-- Fila 2: Teléfono, Email, Botón CF -->
              <div class="col-3">
                <q-input
                  v-model="cliente.telefono"
                  label="Teléfono"
                  dense
                  outlined
                  mask="####-####"
                  style="font-size: 13px;"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="cliente.email"
                  label="Email"
                  dense
                  outlined
                  type="email"
                  style="font-size: 13px;"
                />
              </div>

              <div class="col-3 flex items-end">
                <q-btn
                  flat
                  dense
                  icon="person"
                  color="warning"
                  label="CF"
                  @click="usarConsumidorFinal"
                  size="xs"
                  class="full-width"
                  style="height: 32px;"
                />
              </div>
            </div>
          </q-form>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const cliente = ref({
  documento: '',
  nombre: '',
  direccion: '',
  telefono: '',
  email: ''
})

const buscarCliente = () => {
  if (cliente.value.documento === '1234567890101') {
    Object.assign(cliente.value, {
      nombre: 'Juan Pérez',
      direccion: 'Zona 1, Huehuetenango',
      telefono: '5555-1234',
      email: 'juan@mail.com'
    })
  } else {
    Object.assign(cliente.value, {
      nombre: '',
      direccion: '',
      telefono: '',
      email: ''
    })
  }
}

const usarConsumidorFinal = () => {
  Object.assign(cliente.value, {
    documento: 'CF',
    nombre: 'Consumidor Final',
    direccion: 'Ciudad',
    telefono: '',
    email: ''
  })
}
</script>