import { Request, Response } from "express";

import {
  createTestDocument,
  listAllTestDocuments,
  getTestDocumentByMessage,
  updateDocumentByMessage,
  deleteDocumentByMessage,
} from "../services/dbService";

export const createTestDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    const message = req.body.message;
    if (!message) {
      return res.status(500).json({
        status: "error",
        message: "You need a message to create a document",
      });
    } else if (typeof message !== "string") {
      return res.status(500).json({
        status: "error",
        message: "The message must be a string",
      });
    }

    const newDocument = await createTestDocument(message);

    return res.status(newDocument.code).json({
      ...newDocument,
    });
  } catch (error) {
    console.error("Error creating test document:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to connect or write a document",
      details: (error as Error).message,
    });
  }
};

export const listAllTestDocumentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const documents = await listAllTestDocuments();

    return res.status(documents.code).json({
      ...documents,
    });
  } catch (error) {
    console.error("Error getting all test documents:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get all documents",
      details: (error as Error).message,
    });
  }
};

export const getTestDocumentByMessageController = async (
  req: Request,
  res: Response
) => {
  try {
    const message = req.body.message;
    if (!message) {
      return res.status(500).json({
        status: "error",
        message: "You need a message to find a document",
      });
    } else if (typeof message !== "string") {
      return res.status(500).json({
        status: "error",
        message: "The message must be a string",
      });
    }

    const documents = await getTestDocumentByMessage(message);

    return res.status(documents.code).json({
      ...documents,
    });
  } catch (error) {
    console.error("Error getting all test documents:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get document by message",
      details: (error as Error).message,
    });
  }
};

export const updateDocumentByMessageController = async (
  req: Request,
  res: Response
) => {
  try {
    const oldMessage = req.body.oldMessage;
    const newMessage = req.body.newMessage;

    if (!oldMessage || !newMessage) {
      return res.status(500).json({
        status: "error",
        message:
          "You need an old message and a new message to update a document",
      });
    } else if (
      typeof newMessage !== "string" ||
      typeof oldMessage !== "string"
    ) {
      return res.status(500).json({
        status: "error",
        message: "New message and old message must be string",
      });
    }

    const documentUpdated = await updateDocumentByMessage(
      oldMessage,
      newMessage
    );

    return res.status(documentUpdated.code).json({
      ...documentUpdated,
    });
  } catch (error) {
    console.error("Error updating test document:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update document by message",
      details: (error as Error).message,
    });
  }
};

export const deleteDocumentByMessageController = async (
  req: Request,
  res: Response
) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(500).json({
        status: "error",
        message: "You need message to delete a document",
      });
    } else if (typeof message !== "string") {
      return res.status(500).json({
        status: "error",
        message: "Message must be string",
      });
    }

    const deleteDocument = await deleteDocumentByMessage(message);

    return res.status(deleteDocument.code).json({
      ...deleteDocument,
    });
  } catch (error) {
    console.error("Error deleting test document:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete document by message",
      details: (error as Error).message,
    });
  }
};
