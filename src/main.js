import { createApp } from 'vue'
import App from './App.vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
// quasar
import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
import { Quasar } from 'quasar'

// router
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(Quasar, {
  plugins: {} // Notify, Dialog, etc.
})

app.use(pinia)
app.use(VueQueryPlugin)
app.use(router)
app.mount('#app')