export const pendientesRoutes = {
  path: '/pendientes',
  component: () => import('../../pos/components/Mainlayout.vue'),
  children: [
    {
      path: '',
      name: 'pendientes',
      component: () => import('@/modules/pendientes/components/pendientesPage.vue'),
      meta: { requiresAuth: true }
    }
  ]
}
