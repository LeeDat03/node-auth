import { z } from "zod";

export const signUpValidator = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email({
      message: "Please provide a valid email",
    }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password confirm must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginValidator = z.object({
  email: z.string().email({
    message: "Please provide a valid email",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
