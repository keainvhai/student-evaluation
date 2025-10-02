import { create } from "zustand";
import api from "../api";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,

  login: async (email, password) => {
    console.log("DEBUG login params:", email, password);
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    const user = res.data.user;
    set({ user, token: res.data.token });
    return user; // 返回 user
  },

  register: async (name, email, password, role) => {
    await api.post("/auth/register", { name, email, password, role });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
