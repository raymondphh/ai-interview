import axios from 'axios';

export function createApiClient() {
  const config = useRuntimeConfig();
  const client = axios.create({ baseURL: config.public.apiBase as string });

  client.interceptors.request.use((req) => {
    const token = useCookie('token').value;
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        useCookie('token').value = null;
        navigateTo('/login');
      }
      return Promise.reject(err);
    }
  );

  return client;
}
