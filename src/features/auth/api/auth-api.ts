import axios from "axios";

import { httpClient } from "@/lib/http-client";
import { clearAuthToken } from "../auth-token";
import type {
  LoginInput,
  RegisterInput,
  SessionResponse,
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

export async function logout() {
  await httpClient.post("/auth/logout");
}
