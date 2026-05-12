export type Controller<Request, Response> = (request: Request) => Promise<Response>;
