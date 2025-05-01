import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { api } from "./socialApi";

// Function to get the stored auth token
export function getStoredToken(): string | null {
  return localStorage.getItem('authToken');
}

// Function to set the auth token
export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${api.defaults.baseURL}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    // Clear any existing auth data
    setStoredToken(null);
    queryClient.setQueryData(["/api/user"], null);
    throw new Error("Unauthorized");
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${api.defaults.baseURL}${url}`;

    const res = await fetch(fullUrl, {
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (res.status === 401) {
      setStoredToken(null);
      queryClient.setQueryData(["/api/user"], null);
      throw new Error("Unauthorized");
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
