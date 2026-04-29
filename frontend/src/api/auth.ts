import axios from 'axios';
import { client } from './client';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export interface TokenPayload {
  user_id: string;
  role: 'admin' | 'teacher' | 'student';
  real_name: string;
  class_number: string;
}

function decodePayload(token: string): TokenPayload {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

export async function login(username: string, password: string): Promise<TokenPayload> {
  const { data } = await axios.post(`${BASE_URL}/token/`, { username, password });
  localStorage.setItem('access', data.access);
  localStorage.setItem('refresh', data.refresh);
  return decodePayload(data.access);
}

export async function logout(): Promise<void> {
  const refresh = localStorage.getItem('refresh');
  if (refresh) {
    await client.post('/token/logout/', { refresh }).catch(() => {});
  }
  localStorage.clear();
}

export function getPayload(): TokenPayload | null {
  const token = localStorage.getItem('access');
  if (!token) return null;
  try {
    return decodePayload(token);
  } catch {
    return null;
  }
}