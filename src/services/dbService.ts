import * as admin from "firebase-admin";

// Get a reference to the Firestore database instance
const db = admin.firestore();

const COLLECTION_NAME = "test_connections";

export const createTestDocument = async (message: string) => {
  try {
    const testData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message,
    };

    // Write the document to a 'tests' collection.
    const docRef = await db.collection(COLLECTION_NAME).add(testData);

    console.log(`Successfully created test document with ID: ${docRef.id}`);

    return {
      status: "success",
      code: 200,
      message: "Firestore connection tested successfully.",
      documentId: docRef.id,
      collection: COLLECTION_NAME,
      data: testData,
      docRef,
    };
  } catch (error) {
    console.error("Error creating test document:", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to connect to or write a document.",
      details: (error as Error).message,
    };
  }
};

export const listAllTestDocuments = async () => {
  try {
    const collectionRef = db.collection(COLLECTION_NAME);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log("No documents found");
      return {
        status: "success",
        code: 404,
        message: "No documents found in collection test_connections",
      };
    }

    const documents: Array<{ id: string } & admin.firestore.DocumentData> = [];

    for (const doc of snapshot.docs) {
      documents.push({ id: doc.id, ...doc.data() });
    }

    return {
      status: "success",
      code: 200,
      message: "All documents listed in test_connections",
      documents,
    };
  } catch (error) {
    console.error("Error getting all test documents", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to get all test documents.",
      details: (error as Error).message,
    };
  }
};

export const getTestDocumentByMessage = async (message: string) => {
  try {
    const collectionRef = db.collection(COLLECTION_NAME);
    const query = collectionRef.where("message", "==", message);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return {
        status: "success",
        code: 404,
        message: `No documents found with message: ${message}`,
      };
    }
    const documents: Array<{ id: string } & admin.firestore.DocumentData> = [];

    for (const doc of snapshot.docs) {
      documents.push({ id: doc.id, ...doc.data() });
    }

    return {
      status: "success",
      code: 200,
      message: `All documents with message ${message}`,
      documents,
    };
  } catch (error) {
    console.error("Error getting test document by message", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to get test documents by message",
      details: (error as Error).message,
    };
  }
};

export const updateDocumentByMessage = async (
  oldMessage: string,
  newMessage: string
) => {
  try {
    const collectionRef = db.collection(COLLECTION_NAME);
    const snapshot = await collectionRef
      .where("message", "==", oldMessage)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.error("Document to update not found in collection");
      return {
        status: "error",
        code: 404,
        message: "Document to update not found in collection",
      };
    }

    const docToUpdate = snapshot.docs[0].ref;

    const updateData = {
      message: newMessage,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docToUpdate.update(updateData);
    return {
      status: "success",
      code: 200,
      message: "Document successfully updated",
      newMessage: newMessage,
    };
  } catch (error) {
    console.error("Error updating document by message", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to update document by message",
      details: (error as Error).message,
    };
  }
};

export const deleteDocumentByMessage = async (message: string) => {
  try {
    const collectionRef = db.collection(COLLECTION_NAME);
    const snapshot = await collectionRef
      .where("message", "==", message)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.error("Document to delete not found in collection");
      return {
        status: "error",
        code: 404,
        message: `Document to delete not found in collection with message: ${message}`,
      };
    }

    const docToDelete = snapshot.docs[0].ref;

    await docToDelete.delete();
    return {
      status: "success",
      code: 200,
      message: "Document successfully deleted",
    };
  } catch (error) {
    console.error("Error deleting a document by message");
    return {
      status: "error",
      code: 500,
      message: "Failed to delete document by message",
      details: (error as Error).message,
    };
  }
};
