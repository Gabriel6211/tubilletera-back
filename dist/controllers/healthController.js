"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const getHealth = (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Fulbito API is running!",
    });
};
exports.getHealth = getHealth;
