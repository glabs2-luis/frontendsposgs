<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="fondo-login">
        <div
          :class="['login-container', { 'login-container-centered': !bodega }]"
        >
          <!-- Columna Izquierda - Logo y Descripción -->
          <div
            :class="[
              'columna-izquierda',
              { 'columna-izquierda-centered': !bodega },
            ]"
          >
            <div class="logo-section">
              <q-img
                src="/img/1.png"
                alt="Logo del sistema"
                class="logo-principal"
              />
              <div class="sistema-titulo">POS GS</div>
            </div>

            <div class="descripcion-bodega">
              <h2
                :class="['bodega-nombre', { 'bodega-no-configurada': !bodega }]"
              >
                {{
                  bodega
                    ? bodega.DESCRIPCION_BODEGA
                    : "No hay bodega configurada"
                }}
              </h2>
              <div v-if="!bodega" class="bodega-warning-container">
                <div class="bodega-warning bg-red-500 text-white">
                  <q-icon name="warning" class="warning-icon text-white" />
                  <span>Contacte al administrador del sistema</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha - Formulario de Login -->
          <div v-if="bodega" class="columna-derecha">
            <q-card class="login-card">
              <q-card-section class="login-header">
                <div class="titulo-login">Iniciar sesión</div>
                <div class="subtitulo-login">Accede a tu cuenta</div>
              </q-card-section>

              <q-card-section class="login-form">
                <q-input
                  ref="focusUsuario"
                  v-model="usuario"
                  label="Usuario"
                  outlined
                  dense
                  class="input-campo"
                  color="primary"
                />

                <q-input
                  ref="focusContra"
                  v-model="password"
                  label="Contraseña"
                  :type="isPwd ? 'password' : 'text'"
                  outlined
                  dense
                  class="input-campo"
                  color="primary"
                  @keydown.enter="realizarLogin"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>

                <q-select
                  v-model="tipoUsuario"
                  :options="opcionesTipoUsuario"
                  label="Tipo de usuario"
                  outlined
                  dense
                  class="input-campo q-mb-md"
                  color="primary"
                />

                <q-checkbox
                  v-model="recordarUsuario"
                  label="Recordar usuario"
                  class="q-mb-md"
                />

                <q-btn
                  label="Iniciar sesión"
                  class="boton-login"
                  @click="realizarLogin"
                  no-caps
                  unelevated
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLogin } from '../composables/useLogin'
import { Login } from '../interfaces/login.interface'
import { useQuery } from '@tanstack/vue-query'
import { loginVendedorAction } from '../action/login-vendedor.action'
import Swal from 'sweetalert2'
import { useUserStore } from '@/stores/user'
import { showErrorNotification, showSuccessNotification } from '@/common/helper/notification'
import { useSucursales } from '@/modules/Sucursales/composables/useSucursales'
import { useBodegas} from '@/modules/bodegas/composables/useBodegas';
import type { Bodega } from '../../bodegas/interfaces/bodegaInterface';
import { useStoreSucursal } from '@/stores/sucursal'
import { useQuasar } from 'quasar'
import { nextTick } from 'vue'

const StoreSucursal = useStoreSucursal()
const { loginMutation } = useUserStore()
const userStore = useUserStore()
const { obtenerSucursal } = useSucursales()
const { obtenerBodegasId } = useBodegas()
const { ObtenerBodegasId2 } = useBodegas()
const router = useRouter()
const usuario = ref('')
const password = ref('')
const bodega = ref<Bodega>()
const recordarUsuario = ref(false)
const focusContra = ref(null)
const focusUsuario = ref(null)
const $q = useQuasar()
const isPwd = ref(true)
const opcionesTipoUsuario = ref<string[]>(['POS', 'ROMPEFILA']);
const tipoUsuario = ref<string>('POS');

const mostrarBodega = async () => {
  const result = await ObtenerBodegasId2();
  if (result && result.obtenerBodegasId && result.obtenerBodegasId.value) {
    bodega.value = result.obtenerBodegasId.value

    StoreSucursal.setbodega(
      bodega.value.CODIGO_BODEGA,
      bodega.value.DESCRIPCION_BODEGA,
      bodega.value.ID_SUCURSAL
    )
    //console.log(bodega.value)
  } else {
    showErrorNotification(
      "Error",
      "No se pudo obtener la bodega, por favor contacte al administrador"
    )
  }
}

// Login
const realizarLogin = () => {
  loginMutation(
    {
      USUARIO: usuario.value,
      PASSWORD: password.value,
    },
    {
      // Login exitoso
      onSuccess: (data) => {
        userStore.tipoUsuarioStore = tipoUsuario.value
        // Rrecordar usuario
        if (recordarUsuario.value) {
          localStorage.setItem("usuarioRecordado", usuario.value)
        } else {
          localStorage.removeItem("usuarioRecordado")
        }

        router.push("/ventas")

      },
      onError: (error: Error) => {
        // Login fallido
        $q.notify({
          message: error.message,
          position: "top-right",
          caption: "Error de inicio de sesión",
          color: "negative",
          icon: "error",
          timeout: 1000,
        });
        nextTick(() => {
          focusContra.value.focus();
          focusContra.value.select();
        });
      },
    }
  );
};

onMounted(async () => {
  await mostrarBodega();

  const usuarioGuardado = localStorage.getItem("usuarioRecordado");
  if (usuarioGuardado) {
    usuario.value = usuarioGuardado;
    recordarUsuario.value = true;
    nextTick(() => {
      focusContra.value.focus();
    });
  } else {
    nextTick(() => {
      focusUsuario.value.focus();
    });
  }
});

</script>


<style scoped>

.fondo-login {
  background: linear-gradient(135deg, hsl(66, 97%, 49%), #252e10);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  display: flex;
  max-width: 900px;
  width: 100%;
  gap: 40px;
  align-items: center;
}

.login-container-centered {
  justify-content: center;
  max-width: 500px;
}

/* Columna Izquierda */
.columna-izquierda {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.columna-izquierda-centered {
  flex: none;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.logo-principal {
  max-width: 160px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.sistema-titulo {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -1px;
}

.descripcion-bodega {
  text-align: center;
  color: white;
}

.bodega-nombre {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #ffeb3b;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease-in-out;
}

.bodega-no-configurada {
  font-size: 3rem;
  color: #ff6b6b !important;
  text-shadow: 1px 1px 2px rgba(8, 0, 0, 0.3);
  animation: pulse 2s infinite;
}

.bodega-warning-container {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 107, 0.15),
    rgba(220, 53, 69, 0.1)
  );
  border: 2px solid rgba(255, 107, 107, 0.4);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  backdrop-filter: blur(8px);
}

.bodega-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ff6b6b;
  font-size: 0.9rem;
  font-weight: 500;
}

.warning-icon {
  font-size: 1.2rem;
  color: #ff6b6b;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.bodega-subtitulo {
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
  max-width: 400px;
  margin: 0 auto;
}

/* Columna Derecha */
.columna-derecha {
  flex: 0 0 350px;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 32px 32px 24px 32px;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
}

.titulo-login {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitulo-login {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 400;
}

.login-form {
  padding: 0 32px 32px 32px;
}

.input-campo {
  margin-bottom: 20px;
}

.input-campo :deep(.q-field__control) {
  border-radius: 8px;
  height: 48px;
}

.input-campo :deep(.q-field__native) {
  font-size: 1rem;
  padding: 0 16px;
}

.boton-login {
  width: 100%;
  height: 48px;
  background: linear-gradient(90deg, #ffeb3b, #e9a908);
  color: #070303;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 8px;
  margin-top: 8px;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(233, 169, 8, 0.3);
}

.boton-login:hover {
  background: linear-gradient(90deg, #fbc02d, #f59e13);
  box-shadow: 0 4px 12px rgba(233, 169, 8, 0.4);
  transform: translateY(-1px);
}

.forgot-password {
  text-align: center;
  margin-top: 24px;
}

.link-forgot {
  color: #e9a908;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

.link-forgot:hover {
  color: #d4940a;
  text-decoration: underline;
}

/* Responsive  */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    gap: 30px;
    max-width: 100%;
  }

  .columna-izquierda {
    text-align: center;
    order: 2;
  }

  .columna-derecha {
    flex: none;
    width: 100%;
    max-width: 350px;
    order: 1;
  }

  .sistema-titulo {
    font-size: 2rem;
  }

  .bodega-nombre {
    font-size: 1.5rem;
  }

  .bodega-subtitulo {
    font-size: 0.9rem;
  }

  .fondo-login {
    padding: 20px 16px;
  }
}

@media (max-width: 480px) {
  .login-card {
    margin: 0 8px;
  }

  .login-header,
  .login-form {
    padding-left: 24px;
    padding-right: 24px;
  }

  .sistema-titulo {
    font-size: 2rem;
  }

  .bodega-nombre {
    font-size: 1.5rem;
  }
}
</style>
