import express from "express";

/**
 * @description This function is used to register a new user
 */
export const signUp = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.log(err);

    return next(err);
  }
};
