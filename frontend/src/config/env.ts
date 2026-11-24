export type DataMode = 'mock' | 'api';

const configuredMode = import.meta.env.VITE_DATA_MODE;

export const appConfig = {
  dataMode: configuredMode === 'api' ? 'api' as const : 'mock' as const,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
};
