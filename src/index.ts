// src/index.ts
import "./types"; // Import types first to register global declarations
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import cors, { CorsOptions } from "cors";
import path from "path";
import {
  loadMiddlewares,
  loadRoutes,
  loadServices,
  loadControllers,
} from "./utils/autoLoader";

const serviceAccount = require("../secrets/serviceAccountKey.json");

// Prevent re-initialization of the database
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase admin SDK: ", error);
  process.exit(1);
}

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8081;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BASE_DIR = path.join(__dirname);

const allowedOrigins = [FRONTEND_URL, `http://localhost:${PORT}`];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback) => {
    const requestOrigin = origin || "null";
    // Allow request when not in production
    if (
      process.env.NODE_ENV !== "production" &&
      (!origin || requestOrigin === "null")
    ) {
      console.log("CORS: Allowed Postman/Local Tool access");
      return callback(null, true);
    }

    // Allow requests from whitelisted origins
    if (origin && allowedOrigins.includes(origin)) {
      console.log(`CORS: Allowed origin ${requestOrigin}`);
      return callback(null, true);
    }

    console.log(
      `CORS: Blocked request from unauthorized origin: ${requestOrigin}`
    );
    callback(new Error("Not allowed by CORS"), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions)); // Allows requests from any origin during development

// Basic middleware
app.use(express.json()); // Allows parsing JSON bodies in requests

// Auto-load services, middlewares, and routes
loadServices(BASE_DIR);
loadControllers(app, BASE_DIR);
loadMiddlewares(app, BASE_DIR);
loadRoutes(app, BASE_DIR);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});
