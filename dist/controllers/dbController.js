"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocumentByMessageController = exports.updateDocumentByMessageController = exports.getTestDocumentByMessageController = exports.listAllTestDocumentsController = exports.createTestDocumentController = void 0;
const dbService_1 = require("../services/dbService");
const createTestDocumentController = async (req, res) => {
    try {
        const message = req.body.message;
        if (!message) {
            return res.status(500).json({
                status: "error",
                message: "You need a message to create a document",
            });
        }
        else if (typeof message !== "string") {
            return res.status(500).json({
                status: "error",
                message: "The message must be a string",
            });
        }
        const newDocument = await (0, dbService_1.createTestDocument)(message);
        return res.status(newDocument.code).json({
            ...newDocument,
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
exports.createTestDocumentController = createTestDocumentController;
const listAllTestDocumentsController = async (req, res) => {
    try {
        const documents = await (0, dbService_1.listAllTestDocuments)();
        return res.status(documents.code).json({
            ...documents,
        });
    }
    catch (error) {
        console.error("Error getting all test documents:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to get all documents",
            details: error.message,
        });
    }
};
exports.listAllTestDocumentsController = listAllTestDocumentsController;
const getTestDocumentByMessageController = async (req, res) => {
    try {
        const message = req.body.message;
        if (!message) {
            return res.status(500).json({
                status: "error",
                message: "You need a message to find a document",
            });
        }
        else if (typeof message !== "string") {
            return res.status(500).json({
                status: "error",
                message: "The message must be a string",
            });
        }
        const documents = await (0, dbService_1.getTestDocumentByMessage)(message);
        return res.status(documents.code).json({
            ...documents,
        });
    }
    catch (error) {
        console.error("Error getting all test documents:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to get document by message",
            details: error.message,
        });
    }
};
exports.getTestDocumentByMessageController = getTestDocumentByMessageController;
const updateDocumentByMessageController = async (req, res) => {
    try {
        const oldMessage = req.body.oldMessage;
        const newMessage = req.body.newMessage;
        if (!oldMessage || !newMessage) {
            return res.status(500).json({
                status: "error",
                message: "You need an old message and a new message to update a document",
            });
        }
        else if (typeof newMessage !== "string" ||
            typeof oldMessage !== "string") {
            return res.status(500).json({
                status: "error",
                message: "New message and old message must be string",
            });
        }
        const documentUpdated = await (0, dbService_1.updateDocumentByMessage)(oldMessage, newMessage);
        return res.status(documentUpdated.code).json({
            ...documentUpdated,
        });
    }
    catch (error) {
        console.error("Error updating test document:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to update document by message",
            details: error.message,
        });
    }
};
exports.updateDocumentByMessageController = updateDocumentByMessageController;
const deleteDocumentByMessageController = async (req, res) => {
    try {
        const message = req.body.message;
        if (!message) {
            return res.status(500).json({
                status: "error",
                message: "You need message to delete a document",
            });
        }
        else if (typeof message !== "string") {
            return res.status(500).json({
                status: "error",
                message: "Message must be string",
            });
        }
        const deleteDocument = await (0, dbService_1.deleteDocumentByMessage)(message);
        return res.status(deleteDocument.code).json({
            ...deleteDocument,
        });
    }
    catch (error) {
        console.error("Error deleting test document:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to delete document by message",
            details: error.message,
        });
    }
};
exports.deleteDocumentByMessageController = deleteDocumentByMessageController;
