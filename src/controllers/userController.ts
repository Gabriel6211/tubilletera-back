import { Request, Response } from "express";

import { createUser, getUserData } from "../services/userService";
import { UserData } from "../types/user";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    // Validate required fields - check if body exists and has required properties
    if (!body || !body.fullName || typeof body.fullName !== "string") {
      return res.status(400).json({
        status: "error",
        message: "You need data to create an User. Required field: fullName",
      });
    }
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No user provided",
      });
    }
    
    // Sanitize userData to only include allowed fields (fullName and photo)
    // This prevents malicious fields like uid or email from overwriting trusted values
    const userData: UserData = {
      fullName: body.fullName,
      photo: body.photo || "",
    };

    const newUser = await createUser(user, userData);

    return res.status(newUser.code).json({
      ...newUser,
    });
  } catch (error) {
    console.error("Error creating new user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create a new user",
      details: (error as Error).message,
    });
  }
};

export const getUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "No user ID provided",
      });
    }
    
    // Verify the authenticated user is requesting their own data
    const authenticatedUserId = req.user?.uid;
    if (!authenticatedUserId) {
      return res.status(401).json({
        status: "error",
        message: "No user provided",
      });
    }
    
    if (authenticatedUserId !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to view this user's data",
      });
    }
    
    const user = await getUserData(userId);

    return res.status(user.code).json({ ...user });
  } catch (error) {
    console.error("Error getting user information:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get user information",
      details: (error as Error).message,
    });
  }
};
