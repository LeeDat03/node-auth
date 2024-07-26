import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { loginValidator, signUpValidator } from "../lib/validators/auth";

import User, { IUser } from "../models/user-model";
import Account, { IAccount } from "../models/account-model";

interface IJWTDecoded {
  id: string;
  name: string;
  iat: number;
  exp: number;
}

const comparePassword = async (passwordInput: string, password: string) => {
  const res = await bcrypt.compare(passwordInput, password);
  return res;
};

const signInToken = (user: IUser) => {
  // create token
  return jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  res: express.Response
) => {
  // generate token
  const token = signInToken(user);

  res.cookie("node-auth-jwt", token, {
    expires: new Date(
      Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN * 24 * 3600 * 1000
    ),
    httpOnly: true,
    // secure: true,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signUp = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get the user data from the request body
    const { name, email, password, passwordConfirm } = signUpValidator.parse(
      req.body
    );

    // if the account for the email already exists, return an error
    const existingAccount = await Account.findOne({
      providerAccountId: email,
    });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Email already in use, please login",
      });
    }

    // Create a new user
    const user: IUser[] = await User.create(
      [
        {
          name,
          email,
        },
      ],
      { session }
    );

    // Create a new account for the user
    const account: IAccount[] = await Account.create(
      [
        {
          user: user[0]._id,
          type: "email",
          provider: "email",
          providerAccountId: email,
          password: password,
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // create token

    // send respone
    return createSendToken(user[0], 201, res);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return next(err);
  }
};

export const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { email, password } = loginValidator.parse(req.body);

    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return next({
        error: "The user does not exist",
        statusCode: 401,
      });
    }

    // find the account
    const account = await Account.findOne({
      providerAccountId: email,
      provider: "email",
    });

    if (!account) {
      return next({
        error:
          "The account does not exist, please sign up or try other methods",
        statusCode: 401,
      });
    }

    // compare password
    const isCorrectPassword = await comparePassword(password, account.password);

    if (!isCorrectPassword) {
      return next({
        error: "Password is incorrect",
        statusCode: 401,
      });
    }

    return createSendToken(user, 200, res);
  } catch (err) {
    return next(err);
  }
};

// change the current token to some expired token
export const logout = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.cookie("node-auth-jwt", "loggedout", {
      // expired in 3s
      expires: new Date(Date.now() + 3 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    return next(err);
  }
};

////////////////////////////////////////////////////////
// Protect route
// because we are using jwt => each request will have a token in header (Bearer + token)
// or we can check by cookie
export const protect = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    // get token
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies["node-auth-jwt"]) {
      token = req.cookies["node-auth-jwt"];
    }

    if (!token) {
      return next({
        error: "You are not logged in",
        statusCode: 401,
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as IJWTDecoded;

    const currentUser = await User.findById(decoded.id as string);
    if (!currentUser) {
      return next({
        statusCode: 400,
        error: "The user belonging to this token is no longer exists.",
      });
    }

    // if everything ok => go to the next middleware
    next();
  } catch (err) {
    return next(err);
  }
};
