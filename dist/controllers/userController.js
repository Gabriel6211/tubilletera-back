"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserController = void 0;
const userService_1 = require("../services/userService");
const createUserController = async (req, res) => {
    try {
        const userData = req.body.userData;
        if (!userData) {
            return res.status(500).json({
                status: "error",
                message: "You need data to create an User",
            });
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "No user provided",
            });
        }
        const newUser = await (0, userService_1.createUser)(user, userData);
        return res.status(newUser.code).json({
            ...newUser,
        });
    }
    catch (error) {
        console.error("Error creating test document:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to connect or write a document",
            details: error.message,
        });
    }
};
exports.createUserController = createUserController;
