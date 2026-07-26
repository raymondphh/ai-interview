import { defineStore } from 'pinia';
import { authService } from '~/services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: useCookie('token').value || null as string | null,
  }),
  actions: {
    async login(email: string, password: string) {
      const { data } = await authService.login(email, password);
      this.setSession(data.token, data.user);
    },
    async register(name: string, email: string, password: string) {
      const { data } = await authService.register(name, email, password);
      this.setSession(data.token, data.user);
    },
    setSession(token: string, user: User) {
      this.token = token;
      this.user = user;
      useCookie('token', { maxAge: 60 * 60 * 24 * 7 }).value = token;
    },
    logout() {
      this.token = null;
      this.user = null;
      useCookie('token').value = null;
    },
  },
});
