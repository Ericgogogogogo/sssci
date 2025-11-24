import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("errors.email_invalid"),
  password: z.string().min(8, "errors.password_min"),
  remember: z.boolean().default(false),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, "errors.name_required"),
    email: z.string().email("errors.email_invalid"),
    password: z
      .string()
      .min(8, "errors.password_min")
      .regex(/[A-Z]/, "errors.password_upper")
      .regex(/[a-z]/, "errors.password_lower")
      .regex(/[0-9]/, "errors.password_digit"),
    confirmPassword: z.string(),
    agree: z.boolean().refine((v) => v === true, { message: "errors.agree_required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "errors.password_mismatch",
  });
