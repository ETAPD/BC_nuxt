// Autentifikacna straz - presmerovanie neprihlasenych na login
export default defineNuxtRouteMiddleware(async () => {
  const { getSession } = await import("~/composables/useAuth");
  const session = await getSession();
  if (!session) {
    return navigateTo("/login");
  }
});
