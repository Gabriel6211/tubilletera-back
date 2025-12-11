"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basePath = void 0;
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
exports.basePath = "/api/health";
const router = (0, express_1.Router)();
router.get("/", healthController_1.getHealth);
exports.default = router;
