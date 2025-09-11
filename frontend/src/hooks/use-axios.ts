"use client";

import { getBackendApiUrl } from "@/lib/constants";
import { fetchAuthSession } from "aws-amplify/auth";
import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type RawAxiosRequestHeaders,
} from "axios";

const API_BASE_URL: string = getBackendApiUrl();

let cachedInstance: AxiosInstance | null = null;

function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL || undefined,
    timeout: 300000, // 5 minutes timeout for long-running queries
  });

  instance.interceptors.request.use(async (config) => {
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      if (idToken) {
        const bearer = `Bearer ${idToken}`;
        if (!config.headers) {
          config.headers = new AxiosHeaders();
        }
        if (config.headers instanceof AxiosHeaders) {
          config.headers.set("Authorization", bearer);
        } else {
          (config.headers as RawAxiosRequestHeaders)["Authorization"] = bearer;
        }
      }
    } catch {
      // No active auth session; proceed without auth header
    }
    return config;
  });

  return instance;
}

export const getAxios = (): AxiosInstance => {
  if (!cachedInstance) {
    cachedInstance = createAxiosInstance();
  }
  return cachedInstance;
};

let rawAxiosInstance: AxiosInstance | null = null;

export const getRawAxios = (): AxiosInstance => {
  if (!rawAxiosInstance) {
    rawAxiosInstance = axios.create({
      timeout: 300000,
    });
  }
  return rawAxiosInstance;
};
