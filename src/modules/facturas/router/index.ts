export const facturasRoutes = {
  path: '/facturas',
  component: () => import('../../pos/components/Mainlayout.vue'), // Usa tu layout principal
  children: [
    {
      path: '', // Ruta base /clientes
      name: 'facturas',
      component: () => import('../components/FacturasPage.vue')
    }
  ]
}
