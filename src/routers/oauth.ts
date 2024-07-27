import express from "express";
import { oauth2Client } from "../lib/oauth2-client";

import {
  handleCallbackGithub,
  handleCallbackGoogle,
} from "../controllers/oauth-controller";

export const oAuth = (router: express.Router) => {
  ///////////////////////////////////////////////
  // * GITHUB
  router.get("/oauth/github", (req: express.Request, res: express.Response) => {
    // redirect the user to the GitHub login page
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
    );
  });

  // handle the callback from GitHub
  router.get("/oauth/github/callback", handleCallbackGithub);

  //////////////////////////////////////////////
  // * GOOGLE
  router.get("/oauth/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
    res.redirect(url);
  });

  router.get("/oauth/google/callback", handleCallbackGoogle);
};
