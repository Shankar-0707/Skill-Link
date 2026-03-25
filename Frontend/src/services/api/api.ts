import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    "x-mock-role": "ORGANISATION",
    "x-mock-user-id": "4353ab12-74bd-461c-9198-4905a6d2f661"
  },
  withCredentials: true
});