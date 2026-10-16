import axios from "axios";

import { getAuthToken } from "@/features/auth/auth-token";
import { restoreMocking } from "@/mocks/enable-mocking";

export const httpClient = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: {
    Accept: "application/json",
  },
});

httpClient.interceptors.request.use(async (config) => {
  await restoreMocking();

  const token = getAuthToken();

  if (token) {
    config.headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});
