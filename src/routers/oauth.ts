import express from "express";
import { handleCallbackGithub } from "../controllers/oauth-controller";

export const oAuth = (router: express.Router) => {
  // * GITHUB
  router.get("/oauth/github", (req: express.Request, res: express.Response) => {
    // redirect the user to the GitHub login page
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
    );
  });

  // handle the callback from GitHub
  router.get("/oauth/github/callback", handleCallbackGithub);
};
