export const notasRoutes = {
  path: "/notas",
  component: () => import("../../pos/components/Mainlayout.vue"),
  children: [
    {
      path: "",
      name: "notas",
      component: () => import("../components/NotasPage.vue"),
    },
  ],
};
