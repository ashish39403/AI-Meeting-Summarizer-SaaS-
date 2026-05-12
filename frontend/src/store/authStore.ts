import { create } from "zustand";

interface AuthState {
  user: any;

  access: string | null;

  refresh: string | null;

  isAuthenticated: boolean;

  login: (
    user: any,
    access: string,
    refresh: string
  ) => void;

  logout: () => void;

  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>(
  (set) => ({
    user: null,

    access: null,

    refresh: null,

    isAuthenticated: false,

    login: (user, access, refresh) => {
      console.log("ACCESS:", access);

      console.log("REFRESH:", refresh);

      // SAVE TOKENS
      localStorage.setItem(
        "access_token",
        access
      );

      localStorage.setItem(
        "refresh_token",
        refresh
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      set({
        user,
        access,
        refresh,
        isAuthenticated: true,
      });
    },

    logout: () => {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem("user");

      set({
        user: null,
        access: null,
        refresh: null,
        isAuthenticated: false,
      });
    },

    initializeAuth: () => {
      const access =
        localStorage.getItem(
          "access_token"
        );

      const refresh =
        localStorage.getItem(
          "refresh_token"
        );

      const user =
        localStorage.getItem("user");

      if (access && refresh && user) {
        set({
          access,
          refresh,
          user: JSON.parse(user),
          isAuthenticated: true,
        });
      }
    },
  })
);