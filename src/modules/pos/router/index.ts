export const posRoutes = {
  path: '/ventas',
  component: () => import('@/modules/pos/components/Mainlayout.vue'),
  children: [
    {
      path: '',
      name: 'MainPOS',
      component: () => import('@/modules/pos/components/Mainpos.vue'),
      meta: { requiresAuth: true }
    }
  ]
}