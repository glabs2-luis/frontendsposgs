export const notasRoutes = {
  path: '/notas',
<<<<<<< HEAD
  component: () => import('../../pos/components/Mainlayout.vue'), 
=======
  component: () => import('../../pos/components/Mainlayout.vue'), // usa tu layout principal
>>>>>>> db7049b (Agregar modulos)
  children: [
    {
      path: '',
      name: 'notas',
<<<<<<< HEAD
      component: () => import('../components/NotasPage.vue'),
      meta: { requiresAuth: true }
=======
      component: () => import('../components/notas.vue') // <- esta ruta ya es correcta para la estructura
>>>>>>> db7049b (Agregar modulos)
    }
  ]
}
