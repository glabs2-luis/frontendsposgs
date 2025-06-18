import { createRouter, createWebHistory } from 'vue-router'

import { loginRoutes } from '@/modules/login/router'
import { posRoutes } from '@/modules/pos/router'
import { clientesRoutes } from '@/modules/clientes/router'
import { facturasRoutes } from '@/modules/facturas/router'
import { notasRoutes } from '@/modules/notas_credito/router'
import { reportesRoutes } from '@/modules/reportes/router'

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
    posRoutes, 
    clientesRoutes,
    facturasRoutes,
    notasRoutes,
    reportesRoutes
  ]
})

export default router
