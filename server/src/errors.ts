// Error de aplicación con código HTTP. El handler global lo traduce a JSON.
export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (m: string) => new AppError(400, m);
export const unauthorized = (m: string) => new AppError(401, m);
export const forbidden = (m: string) => new AppError(403, m);
export const notFound = (m: string) => new AppError(404, m);
export const conflict = (m: string) => new AppError(409, m);
