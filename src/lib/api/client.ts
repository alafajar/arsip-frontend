import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // agar cookie refresh ikut setiap request
});

// TODO(FE-002): request interceptor (Bearer) + response interceptor (401 → refresh → retry)

export default apiClient;
