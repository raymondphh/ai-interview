import { createApiClient } from './api';

export const dashboardService = {
  stats() {
    return createApiClient().get('/dashboard/stats');
  },
};
