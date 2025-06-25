export const clientesRoutes = {
  path: '/clientes',
  component: () => import('../../pos/components/Mainlayout.vue'), // Usa tu layout principal
  children: [
    {
      path: '', // Ruta base /clientes
      name: 'clientes',
      component: () => import('../components/ClientesPage.vue'),
      meta: { requiresAuth: true }

    }
  ]
}
