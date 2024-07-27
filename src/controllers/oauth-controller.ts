import axios from "axios";
import express from "express";

import {
  getUserEmailGithub,
  getUserInfoGithub,
  getUserInfoGoogle,
} from "../types/oauth";

import Account from "../models/account-model";
import User, { IUser } from "../models/user-model";

import { createSendToken } from "./auth-controller";

import { oauth2Client } from "../lib/oauth2-client";

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
        },
      }),
      axios({
        method: "GET",
        url: "https://api.github.com/user",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

export const handleCallbackGoogle = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // get the code from the query gg return
  const { code } = req.query;

  if (!code) {
    return next(new Error("No code provided"));
  }

  try {
    // get the access token
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // get user info
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const userInfo: getUserInfoGoogle = userInfoResponse.data;

    // check if user already exists
    let currUser: IUser | null;

    currUser = await User.findOne({
      email: userInfo.email,
    });

    if (!currUser) {
      currUser = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.picture,
      });
    }

    //
    const currAccount = await Account.findOne({
      providerAccountId: userInfo.email,
      provider: "google",
    });

    if (!currAccount) {
      await Account.create({
        type: "oauth",
        provider: "google",
        providerAccountId: userInfo.email,
        accessToken: tokens.access_token,
        tokenType: "bearer",
      });
    }

    return createSendToken(currUser, 200, res);
  } catch (err) {
    next(err);
  }
};
