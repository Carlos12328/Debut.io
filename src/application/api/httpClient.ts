export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpClient {
  request<T>(method: HttpMethod, url: string, body?: unknown): Promise<T>;
}
