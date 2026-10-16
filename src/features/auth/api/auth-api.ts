import axios from "axios";

import { httpClient } from "@/lib/http-client";
import { clearAuthToken } from "../auth-token";
import type {
  LoginInput,
  RegisterInput,
  SessionResponse,
  UpdateAvatarInput,
  UpdateProfileInput,
} from "../types";

export async function login(
  input: LoginInput,
): Promise<SessionResponse> {
  const { data } =
    await httpClient.post<SessionResponse>(
      "/auth/login",
      input,
    );

  return data;
}

export async function register(
  input: RegisterInput,
): Promise<SessionResponse> {
  const { data } =
    await httpClient.post<SessionResponse>(
      "/auth/register",
      input,
    );

  return data;
}

export async function getAuthSession():
Promise<SessionResponse> {
  try {
    const { data } =
      await httpClient.get<SessionResponse>(
        "/auth/session",
      );

    return data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      clearAuthToken();

      return { session: null };
    }

    throw error;
  }
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<SessionResponse> {
  const { data } =
    await httpClient.patch<SessionResponse>(
      "/auth/profile",
      input,
    );

  return data;
}

export async function updateAvatar(
  input: UpdateAvatarInput,
): Promise<SessionResponse> {
  const { data } =
    await httpClient.patch<SessionResponse>(
      "/auth/profile/avatar",
      input,
    );

  return data;
}

export async function removeAvatar(): Promise<SessionResponse> {
  const { data } =
    await httpClient.delete<SessionResponse>(
      "/auth/profile/avatar",
    );

  return data;
}

export async function logout() {
  await httpClient.post("/auth/logout");
}
