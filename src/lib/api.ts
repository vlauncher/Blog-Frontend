export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  public setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  public clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = this.getAccessToken();

    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Auto-refresh token on 401 Unauthorized
    if (response.status === 401 && this.getRefreshToken()) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: this.getRefreshToken() }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          this.setTokens(data.accessToken, data.refreshToken);

          // Retry original request with new token
          headers.set("Authorization", `Bearer ${data.accessToken}`);
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          this.clearTokens();
        }
      } catch {
        this.clearTokens();
      }
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = json.message || "An unexpected error occurred";
      const error: any = new Error(errorMsg);
      error.status = response.status;
      error.errors = json.errors;
      throw error;
    }

    return json as T;
  }

  // HTTP Helper Methods
  get<T>(endpoint: string, headers?: HeadersInit) {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  post<T>(endpoint: string, body?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  }

  put<T>(endpoint: string, body?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  }

  patch<T>(endpoint: string, body?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  }

  delete<T>(endpoint: string, headers?: HeadersInit) {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

export const api = new ApiClient();
