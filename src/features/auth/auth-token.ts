const authTokenStorageKey =
  "jungle-nft-marketplace:auth-token:v1";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(
      authTokenStorageKey,
    );
  } catch {
    return null;
  }
}

export function saveAuthToken(token: string) {
  window.localStorage.setItem(
    authTokenStorageKey,
    token,
  );
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    authTokenStorageKey,
  );
}
