import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

/**
 * Middleware to verify Firebase Auth token and authenticate the user
 * Expects the token to be in the Authorization header as: "Bearer <token>"
 * If successful, attaches the decoded token to req.user
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "No authorization token provided",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach the decoded token info to the request object
    // This makes it available in controllers via req.user
    console.log("Decoded token:", decodedToken);
    req.user = decodedToken;
    console.log("Request user:", req.user);

    // Call next to proceed to the next middleware or controller
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
      details: (error as Error).message,
    });
  }
};
