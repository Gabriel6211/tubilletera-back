import * as admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

import { User, UserData } from "../types/user";

const db = admin.firestore();

const COLLECTION_NAME = "users";

export const createUser = async (user: DecodedIdToken, userData: UserData) => {
  try {
    // Use the user's uid from the decoded token
    const profile = {
      uid: user.uid,
      email: user.email,
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create the user document with uid as the document ID
    await db.collection(COLLECTION_NAME).doc(user.uid).set(profile);

    return {
      status: "success",
      code: 201,
      message: "User created successfully",
      data: {
        uid: user.uid,
        email: user.email,
        ...userData,
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to connect to or create an user.",
      details: (error as Error).message,
    };
  }
};

export const getUserData = async (userId: string) => {
  try {
    const userRef = db.collection(COLLECTION_NAME).doc(userId);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return {
        status: "success",
        code: 404,
        message: `No user found with ID: ${userId}`,
      };
    }
    const userData = userDoc.data();

    const userWithDocId = {
      id: userDoc.id,
      ...userData,
    };

    return {
      status: "success",
      code: 200,
      message: `User with ID ${userId}`,
      user: userWithDocId,
    };
  } catch (error) {
    console.error("Error getting user information:", error);
    return {
      status: "error",
      code: 500,
      message: "Failed to get user information",
      details: (error as Error).message,
    };
  }
};
