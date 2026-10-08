import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email"),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{9,14}$/, "Please provide a valid phone number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const sendSignupOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Please provide a valid phone number"
    ),
});

export const verifyPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Please provide a valid phone number"
    ),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const requestLoginOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Please provide a valid phone number"
    ),
});

export const verifyLoginOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Please provide a valid phone number"
    ),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const requestPasswordResetSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Please provide a valid phone number"
    ),
});

export const verifyPasswordResetSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Please provide a valid phone number"
    ),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Please provide a valid phone number"
    ),

  resetToken: z
    .string()
    .trim()
    .min(1, "Reset token is required"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),
});