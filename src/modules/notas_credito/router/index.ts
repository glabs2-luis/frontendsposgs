export const notasRoutes = {
  path: '/notas',
  component: () => import('../../pos/components/Mainlayout.vue'), // usa tu layout principal
  children: [
    {
      path: '',
      name: 'notas',
      component: () => import('../components/NotasPage.vue') // <- esta ruta ya es correcta para la estructura
    }
  ]
}
