import { create } from "zustand";
import api from "../api";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,

  // 登录
  // login: async (email, password) => {
  //   // console.log("DEBUG login params:", email, password);
  //   const res = await api.post("/auth/login", { email, password });
  //   localStorage.setItem("token", res.data.token);
  //   const user = res.data.user;
  //   set({ user, token: res.data.token });
  //   return user; // 返回 user
  // },
  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;
    // 保存到 localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    // 更新全局状态
    set({ user, token });
    return user;
  },

  register: async (name, email, password, role) => {
    await api.post("/auth/register", { name, email, password, role });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
