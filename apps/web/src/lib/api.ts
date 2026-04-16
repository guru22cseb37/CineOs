export const getApiUrl = (path: string = '') => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cine-os-api.vercel.app/api';
  // Remove trailing slash from base and leading slash from path for clean concat
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanBase}${cleanPath ? `/${cleanPath}` : ''}`;
};

export const API_BASE = getApiUrl();
