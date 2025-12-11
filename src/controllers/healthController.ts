import { Request, Response } from "express";

export const getHealth = (req: Request, res: Response) => {
  return res.status(200).json({
    status: "success",
    message: "Fulbito API is running!",
  });
};
