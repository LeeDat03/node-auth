import express from "express";
import {
  getAuthMe,
  login,
  logout,
  protect,
  signUp,
} from "./../controllers/auth-controller";

export const auth = (router: express.Router) => {
  router.post("/register", signUp);
  router.post("/login", login);
  router.get("/logout", logout);

  router.get("/auth/me", protect, getAuthMe);

  router.get("/hello", protect, (req, res) => {
    res.send("Hello");
  });
};
