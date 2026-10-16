import axios from "axios";

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

  return config;
});
