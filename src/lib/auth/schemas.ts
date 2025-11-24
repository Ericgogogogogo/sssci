import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("auth.errors.email_invalid"),
  password: z.string().min(8, "auth.errors.password_min"),
  remember: z.boolean().default(false),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, "auth.errors.name_required"),
    email: z.string().email("auth.errors.email_invalid"),
    password: z
      .string()
      .min(8, "auth.errors.password_min")
      .regex(/[A-Z]/, "auth.errors.password_upper")
      .regex(/[a-z]/, "auth.errors.password_lower")
      .regex(/[0-9]/, "auth.errors.password_digit"),
    confirmPassword: z.string(),
    agree: z.boolean().refine((v) => v === true, { message: "auth.errors.agree_required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "auth.errors.password_mismatch",
  });