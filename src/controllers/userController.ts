import { Request, Response } from "express";

import { createUser, getUserData } from "../services/userService";
import { UserData } from "../types/user";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const userData: UserData = req.body;
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
    if (!userData.photo) {
      userData.photo = "";
    }

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
      return res.status(500).json({
        status: "error",
        message: "No user ID provided",
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
