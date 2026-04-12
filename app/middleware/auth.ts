export default defineNuxtRouteMiddleware(async () => {
  const { getSession } = await import("~/composables/useAuth");
  const session = await getSession();
  if (!session) {
    return navigateTo("/login");
  }
});
