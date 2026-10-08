import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetTokenHash: {
  type: String,
  select: false,
  default: null,
},

passwordResetExpiresAt: {
  type: Date,
  select: false,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;