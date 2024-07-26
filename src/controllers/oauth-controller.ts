import axios from "axios";
import express from "express";
import { getUserEmailGithub, getUserInfoGithub } from "../types/oauth";
import Account from "../models/account-model";
import User, { IUser } from "../models/user-model";
import jwt from "jsonwebtoken";

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

//////////////////////////////////////////////////////
export const handleCallbackGithub = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const requestToken = req.query.code;

  try {
    const tokenRespone = await axios({
      method: "post",
      url: `https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${requestToken}`,
      headers: {
        Accept: "application/json",
      },
    });
    const accessToken = tokenRespone.data.access_token;

    // GET USER EMAIL
    // Make both requests concurrently
    const [userEmailRes, userInfoRes] = await Promise.all([
      axios({
        method: "GET",
        url: "https://api.github.com/user/public_emails",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }),
      axios({
        method: "GET",
        url: "https://api.github.com/user",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }),
    ]);

    // filter to get only the needed email
    const userEmail = (userEmailRes.data as getUserEmailGithub[]).filter(
      (emailInfo) => emailInfo.primary && emailInfo.visibility === "public"
    )[0].email;

    const userInfo: getUserInfoGithub = userInfoRes.data;

    //  Check if the user already exists
    let currUser: IUser | null;
    currUser = await User.findOne({
      email: userEmail,
    });

    if (!currUser) {
      currUser = await User.create({
        email: userEmail,
        name: userInfo.login,
        image: userInfo.avatar_url,
      });
    }

    // Check if the account already exists
    const currAccount = await Account.findOne({
      providerAccountId: userEmail,
      provider: "github",
    });

    if (!currAccount) {
      await Account.create({
        type: "oauth",
        provider: "github",
        providerAccountId: userEmail,
        accessToken: accessToken,
        tokenType: "bearer",
      });
    }

    return createSendToken(currUser, 200, res);
  } catch (err) {
    next(err);
  }
};
