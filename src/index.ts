// src/index.ts
import "./types"; // Import types first to register global declarations
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import cors, { CorsOptions } from "cors";
import path from "path";
import fs from "fs";
import {
  loadMiddlewares,
  loadRoutes,
  loadServices,
  loadControllers,
} from "./utils/autoLoader";

// Load environment variables from .env file
dotenv.config();

// Initialize Firebase Admin SDK
// Support both file path (GOOGLE_APPLICATION_CREDENTIALS) and JSON string (GOOGLE_SERVICE_ACCOUNT)
let serviceAccount: admin.ServiceAccount;

if (process.env.GOOGLE_SERVICE_ACCOUNT) {
  // Load from environment variable as JSON string
  try {
    serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Error parsing GOOGLE_SERVICE_ACCOUNT JSON: ", error);
    process.exit(1);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Load from file path
  try {
    const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const fileContent = fs.readFileSync(filePath, "utf8");
    serviceAccount = JSON.parse(fileContent);
  } catch (error) {
    console.error(
      "Error reading service account file from GOOGLE_APPLICATION_CREDENTIALS: ",
      error
    );
    process.exit(1);
  }
} else {
  console.error(
    "Error: GOOGLE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS environment variable is required"
  );
  process.exit(1);
}

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
