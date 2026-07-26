import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const publicPages = ['/login', '/register'];

  if (!publicPages.includes(to.path) && !auth.token) {
    return navigateTo('/login');
  }
  if (publicPages.includes(to.path) && auth.token) {
    return navigateTo('/dashboard');
  }
});
