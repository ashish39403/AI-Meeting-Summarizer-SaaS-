import api from "@/lib/axios";

import type {
  AuthResponse,
  User,
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
} from "@/types";

export const authService = {
  login: async (
    data: LoginInput
  ): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>(
      "/api/auth/login/",
      data
    );

    return res.data;
  },

  register: async (
    data: RegisterInput
  ): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>(
      "/api/auth/register/",
      data
    );

    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout/");
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get<User>(
      "/api/auth/profile/"
    );

    return res.data;
  },

  updateProfile: async (
    data: Partial<User>
  ): Promise<User> => {
    const res = await api.patch<User>(
      "/api/auth/profile/",
      data
    );

    return res.data;
  },

  changePassword: async (
    data: ChangePasswordInput
  ): Promise<void> => {
    await api.post(
      "/api/auth/change-password/",
      data
    );
  },

  forgotPassword: async (
    email: string
  ): Promise<void> => {
    await api.post(
      "/api/auth/forgot-password/",
      {
        email,
      }
    );
  },
};