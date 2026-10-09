import express from "express";

import { signup,login,sendSignupOtp,verifyPhone,requestLoginOtp,verifyLoginOtp,requestPasswordReset,resetPassword,verifyPasswordReset } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { signupSchema,loginSchema,sendSignupOtpSchema,verifyPhoneSchema,requestLoginOtpSchema,verifyLoginOtpSchema,requestPasswordResetSchema,resetPasswordSchema ,verifyPasswordResetSchema} from "../validators/auth.validator.js";
import { authRateLimiter, otpRateLimiter,} from "../middleware/rate-limit.middleware.js";


const router = express.Router();






router.post( "/signup",authRateLimiter, validate(signupSchema), signup);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/send-signup-otp", otpRateLimiter, validate(sendSignupOtpSchema), sendSignupOtp);
router.post("/verify-phone", otpRateLimiter, validate(verifyPhoneSchema), verifyPhone);
router.post("/request-login-otp", otpRateLimiter, validate(requestLoginOtpSchema), requestLoginOtp);
router.post("/verify-login-otp", otpRateLimiter, validate(verifyLoginOtpSchema), verifyLoginOtp);
router.post("/request-password-reset", authRateLimiter, validate(requestPasswordResetSchema), requestPasswordReset);
router.post("/reset-password",authRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/verify-password-reset",otpRateLimiter,validate(verifyPasswordResetSchema),verifyPasswordReset);




export default router;