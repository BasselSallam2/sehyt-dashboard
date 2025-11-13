import type { tokenDecode } from "@modules/Auth/auth.interface";

export {};
declare global {
  namespace Express {
    interface Request {
      user?: tokenDecode
    }
  }
}