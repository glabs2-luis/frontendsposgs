export const reportesRoutes = {
  path: '/reportes',
  component: () => import('../../pos/components/Mainlayout.vue'),
  children: [
    {
      path: '',
      name: 'reportes',
      component: () => import('../components/ReportesPage.vue'),
      meta: { requiresAuth: true }
    }
  ]
}
