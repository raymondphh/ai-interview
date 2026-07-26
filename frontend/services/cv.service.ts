import { createApiClient } from './api';

export const cvService = {
  list() {
    return createApiClient().get('/cv');
  },
  get(id: string) {
    return createApiClient().get(`/cv/${id}`);
  },
  upload(file: File) {
    const form = new FormData();
    form.append('cv', file);
    return createApiClient().post('/cv/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyze(id: string) {
    return createApiClient().post(`/cv/${id}/analyze`);
  },
};
