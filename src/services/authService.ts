import { authApi } from "@/lib/api";
import type { User } from "@/lib/types";

export const authService = {
  login: (email: string, password: string): Promise<User> =>
    authApi.signIn({ email, password }),
  register: (name: string, email: string, password: string): Promise<User> =>
    authApi.signUp({ name, email, password }),
  logout: (): Promise<void> => authApi.signOut(),
  forgotPassword: (email: string): Promise<void> => authApi.resetPassword(email),
  resetPassword: (email: string): Promise<void> => authApi.resetPassword(email),
  confirmPasswordReset: (token: string, password: string): Promise<void> =>
    authApi.confirmPasswordReset(token, password),
  current: (): User | null => authApi.getCurrentUser(),
  updateProfile: authApi.updateProfile.bind(authApi),
};
