<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>

      <q-form class="flex flex-center fondo-login">
        
       
        <q-card class="q-pa-lg shadow-2" style="width: 100%; max-width:      400px; border-radius: 8px;">
          <q-card-section class="text-center">
            <div class="text-weight-bold text-h5" >Inicio de sesión</div>
            <div class="text-subtitle2">POS GS</div>

             <q-img src="/img/1.png" alt="Logo del sistema"
              style="max-width: 160px; border-radius: 8px;"
              class="q-ma-md"/>
            </q-card-section>

          <q-card-section>
        
            <q-label class="text-weight-bold">Ingrese su Usuario</q-label>
            <q-input
              v-model="usuario" label="Usuario" dense outlined
              class="q-mt-md" />
            
            <q-input v-model="password" label="Contraseña"
              type="password" dense outlined
              class="q-mt-md" @keydown.enter="realizarLogin" />

            <q-btn label="Iniciar sesión" class="boton-amarillo espacio-arriba"
              @click="realizarLogin"  />
           
          </q-card-section>
        </q-card>

      </q-form>
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
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/user'
import { showErrorNotification, showSuccessNotification } from '@/common/helper/notification'

const { loginMutation } = useUserStore()

const router = useRouter()
const usuario = ref('')
const password = ref('')

const realizarLogin =  () => {

    loginMutation({
    USUARIO: usuario.value,
    PASSWORD: password.value
    }, 

     {
      onSuccess:(data) => {
      //Login exitoso

      router.push('/ventas')
  }, 

      onError:(error: Error) => {
        //Login fallido
        showErrorNotification('Error de inicio de sesión', error.message )
      }

     })
 }
  
</script>

<style scoped>

.fondo-login {
  background: linear-gradient(135deg, hsl(66, 97%, 49%), #252e10);
  min-height: 100vh;
}

.boton-amarillo {
  background: linear-gradient(90deg, #FFEB3B, #e9a908);
  color: #070303;
  width: 80%;
  font-weight: 500;
  text-align: center;  
  display: block;      
  margin: 0 auto;    
  border-radius: 8px;
  box-shadow:  2px 6px rgba(5, 4, 4, 0.1);
  transition: all 0.2s ease-in-out;
  font-size: 0.9rem;    
}

.boton-amarillo:hover {
  background: linear-gradient(90deg, #FBC02D, #f59e13);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.espacio-arriba {
  margin-top: 24px !important; 
}



</style>