import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";

export const BackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${BackendUrl}/user`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem("vaultmeet-auth") || "{}").state
    ?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface StoreState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (googleData: {
    email: string;
    name: string;
    picture: string;
    googleId: string;
  }) => Promise<void>;
  register: (data: {
    fullname: { firstname: string; lastname: string };
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  verifyUser: () => Promise<void>;
}

const useStore = create<StoreState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      loading: false,
      error: null,
      notifications: [],
      unreadNotificationCount: 0,

      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post("/login", { email, password });
          const { token, user } = response.data;
          document.cookie = `token=${token}; path=/; secure; samesite=none; max-age=${7 * 24 * 60 * 60}`; // 7 days
          set({ token, user, isAuthenticated: true, loading: false });
        } catch (error: unknown) {
          console.error("Login failed:", error);
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Failed to login",
            loading: false,
          });
          throw error;
        }
      },

      googleLogin: async (googleData) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post("/google-login", googleData);
          console.log("google login response", response.data);
          const { token, user } = response.data;
          document.cookie = `token=${token}; path=/; secure; samesite=none; max-age=${7 * 24 * 60 * 60}`; // 7 days

          set({ token, user, isAuthenticated: true, loading: false });
        } catch (error: unknown) {
          console.error("Google login failed:", error);
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Failed to login with Google",
            loading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post("/register", data);
          const { token, user } = response.data;
          document.cookie = `token=${token}; path=/; secure; samesite=none; max-age=${7 * 24 * 60 * 60 * 1000 * 365 * 5}`; // 7 days
          set({ token, user, isAuthenticated: true, loading: false });
        } catch (error: unknown) {
          console.error("Registration failed:", error);
          set({
            error:
              error instanceof AxiosError
                ? error.response?.data?.message
                : "Failed to register",
            loading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post("/logout");
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          document.cookie = `token=; path=/; secure; samesite=none; max-age=0`; // 7 days
          localStorage.removeItem("vaultmeet-auth");
          set({ token: null, isAuthenticated: false, user: null, error: null });
        }
      },

      checkAuth: () => {
        const token = JSON.parse(localStorage.getItem("vaultmeet-auth") || "{}")
          .state.token;
        const isAuth = !!token;
        set({ isAuthenticated: isAuth, token });
        return isAuth;
      },

      verifyUser: async () => {
        const token = JSON.parse(localStorage.getItem("vaultmeet-auth") || "{}")
          .state.token;
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          set({ loading: true, error: null });
          await api.get("/me");
          set({ loading: false });
        } catch (error) {
          console.error("Error verifying user:", error);
          localStorage.removeItem("vaultmeet-auth");
          document.cookie = `token=; path=/; secure; samesite=none; max-age=0`;
          set({
            isAuthenticated: false,
            token: null,
            user: null,
            error: "Session expired",
            loading: false,
          });
        }
      },
    }),
    {
      name: "replayStore",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useStore;
