export const settingsRoutes = {
  path: '/configuracion',
  component: () => import('../../pos/components/Mainlayout.vue'), 
  children: [
    {
      path: '', // Ruta base /clientes
      name: 'configuracion',
      component: () => import('../components/configuracion.vue'),
      meta: { requiresAuth: true }
    }
  ]
}
