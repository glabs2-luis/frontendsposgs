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
            <!-- <q-select
              v-model="empresa"
              :options="empresas"
              label="Seleccionar empresa"
              dense
              outlined
              emit-value
              map-options
            /> -->

            <q-input
              v-model="usuario"
              label="Usuario"
              dense
              outlined
              class="q-mt-md"
            />

            <q-input
              v-model="password"
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
              @click="realizarLogin"
            />
          </q-card-section>
        </q-card>

      </q-page>
    </q-page-container>
  </q-layout>
</template>


<script lang="ts" setup>


import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLogin } from '../composables/useLogin'
import { Login } from '../interfaces/login.interface'
import { useQuery } from '@tanstack/vue-query'
import { loginVendedorAction } from '../action/login-vendedor.action'


const fromLogin = ref({
  usaurio: '',
  pasword:''
})


const router = useRouter()

//Formulario
const empresa = ref('')
const usuario = ref('')
const password = ref('')

const realizarLogin = () =>{
loginVendedorAction({USUARIO:usuario.value,PASSWORD:password.value})
}






    




</script>

<style scoped>

.fondo-login {
  background: linear-gradient(135deg, #81d620, #2a5298);
  min-height: 100vh;
}

</style>