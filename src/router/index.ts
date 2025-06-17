import { createRouter, createWebHistory } from 'vue-router'

import { loginRoutes } from '@/modules/login/router'
import { posRoutes } from '@/modules/pos/router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Redirección raíz
    {
      path: '/',
      redirect: '/login'
    },

    // Rutas por módulo
    loginRoutes,
    posRoutes
  ]
})

export default router
