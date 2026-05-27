import { http } from '../../../services/http';

export const authApi = {
  async login(payload) {
    const res = await http.post('/auth/login', payload);
    return res.data;
  },
};
