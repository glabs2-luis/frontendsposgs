<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center fondo-login">

        <q-card class="q-pa-lg shadow-2" style="width: 100%; max-width: 400px; border-radius: 8px;">
          <q-card-section class="text-center">
            <div class="text-h6">Inicio de sesión</div>
            <div class="text-subtitle2">POS GS</div>
          </q-card-section>

          <q-card-section>
            <q-select
              v-model="empresa"
              :options="empresas"
              label="Seleccionar empresa"
              dense
              outlined
              emit-value
              map-options
            />

            <q-input
              v-model="usuario"
              label="Usuario"
              dense
              outlined
              class="q-mt-md"
            />

            <q-input
              v-model="contrasena"
              label="Contraseña"
              type="password"
              dense
              outlined
              class="q-mt-md"
            />

            <q-btn
              label="Iniciar sesión"
              color="primary"
              class="full-width q-mt-lg"
              @click="handleLogin"
            />
          </q-card-section>
        </q-card>

      </q-page>
    </q-page-container>
  </q-layout>
</template>


<script lang="ts">

import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()

//Formulario
const empresa = ref('')
const usuario = ref('')
const password = ref('')





</script>

<style scoped>

.fondo-login {
  background: linear-gradient(135deg, #81d620, #2a5298);
  min-height: 100vh;
}

</style>