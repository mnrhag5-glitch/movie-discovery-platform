import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: ["signup", "login", "password-reset"],
      required: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
     
    },

    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
  type: Number,
  default: 5,
},
     lastSentAt: {
  type: Date,
  default: Date.now,
},
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

otpChallengeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const OtpChallenge = mongoose.model(
  "OtpChallenge",
  otpChallengeSchema
);

export default OtpChallenge;