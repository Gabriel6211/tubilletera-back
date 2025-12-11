"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
require("./types"); // Import types first to register global declarations
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const autoLoader_1 = require("./utils/autoLoader");
const serviceAccount = require("../secrets/serviceAccountKey.json");
// Prevent re-initialization of the database
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully");
}
catch (error) {
    console.error("Error initializing Firebase admin SDK: ", error);
    process.exit(1);
}
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8081;
const FRONTEND_URL = process.env.FRONTEND_URL;
const BASE_DIR = path_1.default.join(__dirname);
const allowedOrigins = [FRONTEND_URL, `http://localhost:${PORT}`];
const corsOptions = {
    origin: (origin, callback) => {
        const requestOrigin = origin || "null";
        // Allow request when not in production
        if (process.env.NODE_ENV !== "production" &&
            (!origin || requestOrigin === "null")) {
            console.log("CORS: Allowed Postman/Local Tool access");
            return callback(null, true);
        }
        // Allow requests from whitelisted origins
        if (origin && allowedOrigins.includes(origin)) {
            console.log(`CORS: Allowed origin ${requestOrigin}`);
            return callback(null, true);
        }
        console.log(`CORS: Blocked request from unauthorized origin: ${requestOrigin}`);
        callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions)); // Allows requests from any origin during development
// Basic middleware
app.use(express_1.default.json()); // Allows parsing JSON bodies in requests
// Auto-load services, middlewares, and routes
(0, autoLoader_1.loadServices)(BASE_DIR);
(0, autoLoader_1.loadControllers)(app, BASE_DIR);
(0, autoLoader_1.loadMiddlewares)(app, BASE_DIR);
(0, autoLoader_1.loadRoutes)(app, BASE_DIR);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access it at http://localhost:${PORT}`);
});
