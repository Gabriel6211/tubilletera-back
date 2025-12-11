import { DecodedIdToken } from "firebase-admin/auth";

// Extend Express Request type to include the user property set by our auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

export {};
