import express from "express";
import {
  handleCallbackGithub,
  login,
  logout,
  protect,
  signUp,
} from "./../controllers/auth-controller";

export const auth = (router: express.Router) => {
  router.post("/register", signUp);
  router.post("/login", login);
  router.get("/logout", logout);

  // redirect the user to the GitHub login page
  router.get("/oauth/github", (req: express.Request, res: express.Response) => {
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`
    );
  });

  // handle the callback from GitHub
  router.get("/oauth/github/callback", handleCallbackGithub);

  router.get("/hello", protect, (req, res) => {
    res.send("Hello");
  });
};
