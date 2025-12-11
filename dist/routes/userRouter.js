"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basePath = void 0;
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const userMiddleware_1 = require("../middleware/userMiddleware");
exports.basePath = "/user";
const router = (0, express_1.Router)();
// Attach the authentication middleware before the controller
router.post("/", userMiddleware_1.authenticateUser, userController_1.createUserController);
exports.default = router;
