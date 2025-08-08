import { createApp } from 'vue'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import axios from 'axios'
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { registerSW } from 'virtual:pwa-register'

// router
import router from './router'

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {}
})

const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(Quasar, {
  plugins: {Notify, Dialog, Loading} 
})

app.use(VueQueryPlugin, {
  enableDevtoolsV6Plugin: true,
})
app.use(pinia)
app.use(router)
app.mount('#app')