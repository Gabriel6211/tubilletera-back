import { Router } from "express";
import {
  createTestDocumentController,
  listAllTestDocumentsController,
  getTestDocumentByMessageController,
  updateDocumentByMessageController,
  deleteDocumentByMessageController,
} from "../controllers/dbController";

export const basePath = "/db/test-connection";

const router = Router();

router.get("/", listAllTestDocumentsController);

router.post("/", createTestDocumentController);

router.get("/message", getTestDocumentByMessageController);

router.patch("/message", updateDocumentByMessageController);

router.delete("/message", deleteDocumentByMessageController);

export default router;
