export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(`La requête a échoué (${response.status}).`, response.status);
    }

    return response.json() as Promise<T>;
  }
}
