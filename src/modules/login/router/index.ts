export const loginRoutes = {
  path: '/login',
  name: 'login',
  component: () => import('../components/LoginPage.vue'),
  meta: { requiresAuth: true }
}
