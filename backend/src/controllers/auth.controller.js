import User from "../models/user.model.js";
import {hashPassword,comparePassword,} from "../utils/password.util.js";
import { generateAccessToken } from "../utils/jwt.util.js";
import OtpChallenge from "../models/otpChallenge.model.js";
import {generateOtp,hashOtp,compareOtp} from "../utils/otp.util.js";
import { normalizePhone } from "../utils/phone.util.js";
import { sendWhatsAppOtp } from "../services/wapix.service.js";
import { generateResetToken, hashResetToken,} from "../utils/password-reset.util.js";




export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
   const normalizedPhone = normalizePhone(phone);
    const existingUser = await User.findOne({
      $or: [{ email }, { phone:normalizedPhone  }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Unable to create account with the provided details",
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      phone: normalizedPhone,
      passwordHash,
      phoneVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: "Account created. Phone verification is required.",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.phoneVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your phone before logging in",
      });
    }

    const isPasswordValid = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendSignupOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const normalizedPhone = normalizePhone(phone);
const user = await User.findOne({
  phone: normalizedPhone,
});

if (!user || user.phoneVerified) {
  return res.status(400).json({
    success: false,
    message: "Unable to send OTP",
  });
}
    

    const existingChallenge = await OtpChallenge.findOne({
      phone: normalizedPhone,
      purpose: "signup",
      consumedAt: null,
    }).sort({ createdAt: -1 });

    if (existingChallenge) {
      const cooldownSeconds = Number(
        process.env.OTP_RESEND_COOLDOWN_SECONDS || 60
      );

      const elapsedSeconds =
        (Date.now() - existingChallenge.lastSentAt.getTime()) / 1000;

      if (elapsedSeconds < cooldownSeconds) {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another OTP",
        });
      }
    }

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);

   await sendWhatsAppOtp({
  phone: normalizedPhone,
  otp,
});

await OtpChallenge.updateMany(
  {
    phone: normalizedPhone,
    purpose: "signup",
    consumedAt: null,
  },
  {
    $set: {
      consumedAt: new Date(),
    },
  }
);

await OtpChallenge.create({
  phone: normalizedPhone,
  purpose: "signup",
  codeHash,
  expiresAt: new Date(
    Date.now() +
      Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
  ),
  attempts: 0,
  lastSentAt: new Date(),
});

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPhone = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const normalizedPhone = normalizePhone(phone);

    const user = await User.findOne({
      phone: normalizedPhone,
    });

    if (!user || user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Unable to verify phone number",
      });
    }

    const challenge = await OtpChallenge.findOne({
      phone: normalizedPhone,
      purpose: "signup",
      consumedAt: null,
    })
      .select("+codeHash")
      .sort({ createdAt: -1 });

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    const maxAttempts = Number(
      process.env.OTP_MAX_ATTEMPTS || 5
    );

    if (challenge.attempts >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP",
      });
    }

    const isOtpValid = await compareOtp(
      otp,
      challenge.codeHash
    );

    if (!isOtpValid) {
      challenge.attempts += 1;
      await challenge.save();

      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired",
      });
    }

    user.phoneVerified = true;
    await user.save();

    challenge.consumedAt = new Date();
    await challenge.save();

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const requestLoginOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const normalizedPhone = normalizePhone(phone);

    const user = await User.findOne({
      phone: normalizedPhone,
      phoneVerified: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unable to send OTP",
      });
    }

    const existingChallenge = await OtpChallenge.findOne({
      phone: normalizedPhone,
      purpose: "login",
      consumedAt: null,
    }).sort({ createdAt: -1 });

    if (existingChallenge) {
      const cooldownSeconds = Number(
        process.env.OTP_RESEND_COOLDOWN_SECONDS || 60
      );

      const elapsedSeconds =
        (Date.now() - existingChallenge.lastSentAt.getTime()) / 1000;

      if (elapsedSeconds < cooldownSeconds) {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another OTP",
        });
      }
    }

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);

    await sendWhatsAppOtp({
      phone: normalizedPhone,
      otp,
    });

    await OtpChallenge.updateMany(
      {
        phone: normalizedPhone,
        purpose: "login",
        consumedAt: null,
      },
      {
        $set: {
          consumedAt: new Date(),
        },
      }
    );

    await OtpChallenge.create({
      phone: normalizedPhone,
      purpose: "login",
      codeHash,
      expiresAt: new Date(
        Date.now() +
          Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
      ),
      attempts: 0,
      lastSentAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const normalizedPhone = normalizePhone(phone);

    const user = await User.findOne({
      phone: normalizedPhone,
      phoneVerified: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const challenge = await OtpChallenge.findOne({
      phone: normalizedPhone,
      purpose: "login",
      consumedAt: null,
    })
      .select("+codeHash")
      .sort({ createdAt: -1 });

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const maxAttempts = Number(
      process.env.OTP_MAX_ATTEMPTS || 5
    );

    if (challenge.attempts >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP",
      });
    }

    const isOtpValid = await compareOtp(
      otp,
      challenge.codeHash
    );

    if (!isOtpValid) {
      challenge.attempts += 1;
      await challenge.save();

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    challenge.consumedAt = new Date();
    await challenge.save();

    const accessToken = generateAccessToken(
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const normalizedPhone = normalizePhone(phone);

    const user = await User.findOne({
      phone: normalizedPhone,
      phoneVerified: true,
    });

    // Same response whether user exists or not.
    // This prevents account/phone enumeration.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, an OTP has been sent",
      });
    }

    const existingChallenge = await OtpChallenge.findOne({
      phone: normalizedPhone,
      purpose: "password-reset",
      consumedAt: null,
    }).sort({ createdAt: -1 });

    if (existingChallenge) {
      const cooldownSeconds = Number(
        process.env.OTP_RESEND_COOLDOWN_SECONDS || 60
      );

      const elapsedSeconds =
        (Date.now() - existingChallenge.lastSentAt.getTime()) / 1000;

      if (elapsedSeconds < cooldownSeconds) {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another OTP",
        });
      }
    }

    const otp = generateOtp();
    const codeHash = await hashOtp(otp);

    await sendWhatsAppOtp({
      phone: normalizedPhone,
      otp,
    });

    await OtpChallenge.updateMany(
      {
        phone: normalizedPhone,
        purpose: "password-reset",
        consumedAt: null,
      },
      {
        $set: {
          consumedAt: new Date(),
        },
      }
    );

    await OtpChallenge.create({
      phone: normalizedPhone,
      purpose: "password-reset",
      codeHash,
      expiresAt: new Date(
        Date.now() +
          Number(process.env.OTP_EXPIRES_MINUTES || 5) * 60 * 1000
      ),
      attempts: 0,
      lastSentAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "If the account exists, an OTP has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPasswordReset = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const normalizedPhone = normalizePhone(phone);

    const challenge = await OtpChallenge.findOne({
      phone: normalizedPhone,
      purpose: "password-reset",
      consumedAt: null,
    })
      .select("+codeHash")
      .sort({ createdAt: -1 });

    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const maxAttempts = Number(
      process.env.OTP_MAX_ATTEMPTS || 5
    );

    if (challenge.attempts >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP",
      });
    }

    const isOtpValid = await compareOtp(
      otp,
      challenge.codeHash
    );

    if (!isOtpValid) {
      challenge.attempts += 1;
      await challenge.save();

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

const user = await User.findOne({
  phone: normalizedPhone,
  phoneVerified: true,
});

if (!user) {
  return res.status(400).json({
    success: false,
    message: "Invalid or expired OTP",
  });
}

const resetToken = generateResetToken();
const resetTokenHash = hashResetToken(resetToken);

user.passwordResetTokenHash = resetTokenHash;
user.passwordResetExpiresAt = new Date(
  Date.now() + 10 * 60 * 1000
);

await user.save();

challenge.consumedAt = new Date();
await challenge.save();

return res.status(200).json({
  success: true,
  message: "OTP verified successfully",
  data: {
    resetToken,
  },
});
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const {
      phone,
      resetToken,
      newPassword,
    } = req.body;

    const normalizedPhone = normalizePhone(phone);

    const resetTokenHash = hashResetToken(resetToken);

    const user = await User.findOne({
      phone: normalizedPhone,
      phoneVerified: true,
      passwordResetTokenHash: resetTokenHash,
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const passwordHash = await hashPassword(newPassword);

    user.passwordHash = passwordHash;

    // Reset token can only be used once
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};