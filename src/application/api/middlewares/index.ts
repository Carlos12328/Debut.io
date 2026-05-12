export type Middleware<Request> = (request: Request) => Promise<Request>;
