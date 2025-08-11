import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { loginRoutes } from '@/modules/login/router'
import { posRoutes } from '@/modules/pos/router'
import { clientesRoutes } from '@/modules/clientes/router'
import { facturasRoutes } from '@/modules/facturas/router'
import { notasRoutes } from '@/modules/notas_credito/router'
import { reportesRoutes } from '@/modules/reportes/router'
import { useUserStore } from '@/stores/user'
import { settingsRoutes } from '@/modules/configuracion/router'
import { pendientesRoutes } from '@/modules/pendientes/router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    loginRoutes,
    posRoutes, 
    clientesRoutes,
    facturasRoutes,
    notasRoutes,
    reportesRoutes,
    settingsRoutes,
    pendientesRoutes
  ]
})

// Proteccion de rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // Si no hay token, 
  if (to.meta.requiresAuth && !token) {
    if (to.path !== '/login') {
      return next('/login')
    } else {
      return next() // no redirige al login
    }
  }

  // Si ya tiene token redirigir a ventas
  if (to.path === '/login' && token) {
    return next('/ventas')
  }

  next()
})

export default router
