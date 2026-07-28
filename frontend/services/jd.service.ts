import { createApiClient } from './api';

export const jdService = {
  list() {
    return createApiClient().get('/jd');
  },
  get(id: string) {
    return createApiClient().get(`/jd/${id}`);
  },
  upload(file: File) {
    const form = new FormData();
    form.append('jd', file);
    return createApiClient().post('/jd/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadFromUrl(url: string) {
    return createApiClient().post('/jd/upload-url', { url });
  },
  analyze(id: string) {
    return createApiClient().post(`/jd/${id}/analyze`);
  },
};
