export interface IHttpResponse {
  ok: boolean;
  status: number;
  headers: { get(name: string): string | undefined };
  json(): Promise<unknown>;
}

export interface IHttpClient {
  get(url: string, configuration: unknown, options?: { headers?: Record<string, string> }): Promise<IHttpResponse>;
  post(url: string, configuration: unknown, options: { headers?: Record<string, string>; body: string }): Promise<IHttpResponse>;
}
