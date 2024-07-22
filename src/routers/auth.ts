import express from "express";
import { signUp } from "./../controllers/auth-controller";

export const auth = (router: express.Router) => {
  router.get("/register", signUp);

  router.get("/login", () => {});
  router.get("/logout", () => {});
};
