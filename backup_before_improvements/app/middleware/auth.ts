export default defineNuxtRouteMiddleware(async (to) => {
  if (to.meta.requiresAuth) {
    const session = await getSession();
    if (!session) {
      return navigateTo("/login");
    }
  }
});
