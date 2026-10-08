import express from "express";

import { signup,login,sendSignupOtp,verifyPhone,requestLoginOtp,verifyLoginOtp,requestPasswordReset,resetPassword } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { signupSchema,loginSchema,sendSignupOtpSchema,verifyPhoneSchema,requestLoginOtpSchema,verifyLoginOtpSchema,requestPasswordResetSchema,resetPasswordSchema } from "../validators/auth.validator.js";

const router = express.Router();






router.post( "/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/send-signup-otp", validate(sendSignupOtpSchema), sendSignupOtp);
router.post("/verify-phone", validate(verifyPhoneSchema), verifyPhone);
router.post("/request-login-otp", validate(requestLoginOtpSchema), requestLoginOtp);
router.post("/verify-login-otp", validate(verifyLoginOtpSchema), verifyLoginOtp);
router.post("/request-password-reset", validate(requestPasswordResetSchema), requestPasswordReset);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
export default router;