import { describe, it, expect, vi,beforeEach } from "vitest";
import request from "supertest";
import OtpChallenge from "./models/otpChallenge.model.js";
import { sendWhatsAppOtp } from "./services/wapix.service.js";
import { compareOtp } from "./utils/otp.util.js";
import { incrementOtpAttempts } from "./utils/otp-attempt.util.js";
import {generateResetToken,hashResetToken,} from "./utils/password-reset.util.js";


vi.mock("./utils/password-reset.util.js", () => ({
  generateResetToken: vi.fn().mockReturnValue("test-reset-token"),
  hashResetToken: vi.fn().mockReturnValue("hashed-reset-token"),
}));


vi.mock("./utils/otp-attempt.util.js", () => ({
  incrementOtpAttempts: vi.fn(),
}));

vi.mock("./models/otpChallenge.model.js", () => ({
  default: {
    findOne: vi.fn(),
    updateMany: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("./services/wapix.service.js", () => ({
  sendWhatsAppOtp: vi.fn().mockResolvedValue({
    success: true,
  }),
}));


vi.mock("./models/user.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("./utils/password.util.js", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  comparePassword: vi.fn(),
  comparePasswordWithDummy: vi.fn().mockResolvedValue(false),
}));

vi.mock("./utils/otp.util.js", () => ({
  generateOtp: vi.fn().mockReturnValue("123456"),
  hashOtp: vi.fn().mockResolvedValue("hashed-otp"),
  compareOtp: vi.fn(),
}));

vi.mock("./utils/jwt.util.js", () => ({
  generateAccessToken: vi.fn().mockReturnValue("test-access-token"),
}));

import app from "./app.js";
import User from "./models/user.model.js";
import {
  comparePassword,
  comparePasswordWithDummy,
} from "./utils/password.util.js";

describe("Auth API", () => {
    beforeEach(() => {
  vi.clearAllMocks();
});
  it("should create a new user", async () => {
    User.findOne.mockResolvedValueOnce(null);

    User.create.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      phone: "919876543210",
      phoneVerified: false,
    });

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "test@example.com",
        phone: "919876543210",
        password: "Password123",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBe(
      "507f1f77bcf86cd799439011"
    );
  });

  it("should reject duplicate account details", async () => {
    User.findOne.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      phone: "919876543210",
    });

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Another User",
        email: "test@example.com",
        phone: "919876543210",
        password: "Password123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Unable to create account with the provided details"
    );
  });

  it("should login successfully", async () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      phone: "919876543210",
      phoneVerified: true,
      loginFailedAttempts: 0,
      loginLockedUntil: null,
      passwordHash: "hashed-password",
      save: vi.fn().mockResolvedValue(),
    };

    User.findOne.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue(user),
    });

    comparePassword.mockResolvedValueOnce(true);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("Login successful");

    expect(response.body.data.accessToken).toBe(
      "test-access-token"
    );
  });

  it("should reject wrong password", async () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      phone: "919876543210",
      phoneVerified: true,
      loginFailedAttempts: 0,
      loginLockedUntil: null,
      passwordHash: "hashed-password",
      save: vi.fn().mockResolvedValue(),
    };

    User.findOne.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue(user),
    });

    comparePassword.mockResolvedValueOnce(false);

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "WrongPassword123",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid email or password"
    );

    expect(user.loginFailedAttempts).toBe(1);
    expect(user.save).toHaveBeenCalled();
  });

    it("should reject unknown email", async () => {
    User.findOne.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue(null),
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid email or password"
    );

    expect(comparePasswordWithDummy).toHaveBeenCalledWith(
      "Password123"
    );
  });
  it("should reject login when phone is not verified", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    name: "Test User",
    email: "test@example.com",
    phone: "919876543210",
    phoneVerified: false,
    loginFailedAttempts: 0,
    loginLockedUntil: null,
    passwordHash: "hashed-password",
    save: vi.fn().mockResolvedValue(),
  };

  User.findOne.mockReturnValueOnce({
    select: vi.fn().mockResolvedValue(user),
  });

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@example.com",
      password: "Password123",
    });

  expect(response.status).toBe(401);

  expect(response.body.success).toBe(false);

  expect(response.body.message).toBe(
    "Invalid email or password"
  );

  expect(comparePassword).not.toHaveBeenCalled();
});

it("should lock account after maximum failed login attempts", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    name: "Test User",
    email: "test@example.com",
    phone: "919876543210",
    phoneVerified: true,
    loginFailedAttempts: 4,
    loginLockedUntil: null,
    passwordHash: "hashed-password",
    save: vi.fn().mockResolvedValue(),
  };

  User.findOne.mockReturnValueOnce({
    select: vi.fn().mockResolvedValue(user),
  });

  comparePassword.mockResolvedValueOnce(false);

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@example.com",
      password: "WrongPassword123",
    });

  expect(response.status).toBe(401);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Invalid email or password");

  expect(user.loginFailedAttempts).toBe(0);
  expect(user.loginLockedUntil).toBeInstanceOf(Date);
  expect(user.save).toHaveBeenCalled();
});
it("should reject login when account is locked", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    name: "Test User",
    email: "test@example.com",
    phone: "919876543210",
    phoneVerified: true,
    loginFailedAttempts: 0,
    loginLockedUntil: new Date(Date.now() + 10 * 60 * 1000),
    passwordHash: "hashed-password",
    save: vi.fn().mockResolvedValue(),
  };

  User.findOne.mockReturnValueOnce({
    select: vi.fn().mockResolvedValue(user),
  });

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@example.com",
      password: "Password123",
    });

  expect(response.status).toBe(429);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe(
    "Too many failed attempts. Please try again later"
  );

  expect(comparePassword).not.toHaveBeenCalled();
});
it("should reject login with invalid email", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "invalid-email",
      password: "Password123",
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Validation failed");
});
it("should reject signup with invalid data", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      name: "A",
      email: "invalid-email",
      phone: "123",
      password: "123",
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Validation failed");

  expect(response.body.errors).toHaveProperty("name");
  expect(response.body.errors).toHaveProperty("email");
  expect(response.body.errors).toHaveProperty("phone");
  expect(response.body.errors).toHaveProperty("password");
});
it("should send signup OTP for a registered unverified phone", async () => {
  User.findOne.mockResolvedValueOnce({
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: false,
  });

  OtpChallenge.findOne.mockReturnValueOnce({
    sort: vi.fn().mockResolvedValue(null),
  });

  OtpChallenge.updateMany.mockResolvedValueOnce({});

  OtpChallenge.create.mockResolvedValueOnce({
    _id: "507f1f77bcf86cd799439013",
  });

  const response = await request(app)
    .post("/api/auth/send-signup-otp")
    .send({
      phone: "919876543210",
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  expect(sendWhatsAppOtp).toHaveBeenCalled();

  expect(OtpChallenge.create).toHaveBeenCalled();
});

it("should verify phone with correct OTP", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: false,
    save: vi.fn().mockResolvedValue(),
  };

  const challenge = {
    _id: "507f1f77bcf86cd799439013",
    phone: "919876543210",
    purpose: "signup",
    codeHash: "hashed-otp",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0,
    maxAttempts: 5,
    consumedAt: null,
    save: vi.fn().mockResolvedValue(),
  };

  User.findOne.mockResolvedValueOnce(user);

  OtpChallenge.findOne.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenge),
    }),
  });

  compareOtp.mockResolvedValueOnce(true);

  const response = await request(app)
    .post("/api/auth/verify-phone")
    .send({
      phone: "919876543210",
      otp: "123456",
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  expect(response.body.message).toBe(
    "Phone verified successfully"
  );

  expect(user.phoneVerified).toBe(true);
  expect(user.save).toHaveBeenCalled();

  expect(challenge.consumedAt).toBeInstanceOf(Date);
  expect(challenge.save).toHaveBeenCalled();
});

it("should reject incorrect OTP", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: false,
  };

  const challenge = {
    _id: "507f1f77bcf86cd799439013",
    codeHash: "hashed-otp",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0,
    maxAttempts: 5,
    consumedAt: null,
  };

  User.findOne.mockResolvedValueOnce(user);

  OtpChallenge.findOne.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenge),
    }),
  });

  compareOtp.mockResolvedValueOnce(false);

  incrementOtpAttempts.mockResolvedValueOnce({
    ...challenge,
    attempts: 1,
  });

  const response = await request(app)
    .post("/api/auth/verify-phone")
    .send({
      phone: "919876543210",
      otp: "999999",
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe(
    "OTP is invalid or expired"
  );

  expect(incrementOtpAttempts).toHaveBeenCalledWith(
    challenge._id
  );
});

it("should reject expired OTP", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: false,
  };

  const challenge = {
    _id: "507f1f77bcf86cd799439013",
    codeHash: "hashed-otp",
    expiresAt: new Date(Date.now() - 60 * 1000),
    attempts: 0,
    maxAttempts: 5,
    consumedAt: null,
  };

  User.findOne.mockResolvedValueOnce(user);

  OtpChallenge.findOne.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenge),
    }),
  });

  const response = await request(app)
    .post("/api/auth/verify-phone")
    .send({
      phone: "919876543210",
      otp: "123456",
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe(
    "OTP is invalid or expired"
  );

  expect(compareOtp).not.toHaveBeenCalled();
});

it("should reject OTP when maximum attempts are reached", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: false,
  };

  const challenge = {
    _id: "507f1f77bcf86cd799439013",
    codeHash: "hashed-otp",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 5,
    maxAttempts: 5,
    consumedAt: null,
  };

  User.findOne.mockResolvedValueOnce(user);

  OtpChallenge.findOne.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenge),
    }),
  });

  const response = await request(app)
    .post("/api/auth/verify-phone")
    .send({
      phone: "919876543210",
      otp: "123456",
    });

  expect(response.status).toBe(429);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe(
    "Too many incorrect attempts. Please request a new OTP"
  );

  expect(compareOtp).not.toHaveBeenCalled();
  expect(incrementOtpAttempts).not.toHaveBeenCalled();
});

it("should login successfully with correct OTP", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    name: "Test User",
    email: "test@example.com",
    phone: "919876543210",
    phoneVerified: true,
  };

  const challenge = {
    _id: "507f1f77bcf86cd799439014",
    phone: "919876543210",
    purpose: "login",
    codeHash: "hashed-otp",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0,
    maxAttempts: 5,
    consumedAt: null,
    save: vi.fn().mockResolvedValue(),
  };

  User.findOne.mockResolvedValueOnce(user);

  OtpChallenge.findOne.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenge),
    }),
  });

  compareOtp.mockResolvedValueOnce(true);

  const response = await request(app)
    .post("/api/auth/verify-login-otp")
    .send({
      phone: "919876543210",
      otp: "123456",
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe("Login successful");

  expect(response.body.data.accessToken).toBe("test-access-token");

  expect(response.body.data.user).toEqual({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  expect(challenge.consumedAt).toBeInstanceOf(Date);
  expect(challenge.save).toHaveBeenCalled();
});


it("should verify password reset OTP and return reset token", async () => {
    User.findOne.mockReset();
OtpChallenge.findOne.mockReset();
compareOtp.mockReset();
  const challenge = {
    _id: "507f1f77bcf86cd799439015",
    phone: "919876543210",
    purpose: "password-reset",
    codeHash: "hashed-otp",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0,
    maxAttempts: 5,
    consumedAt: null,
    save: vi.fn().mockResolvedValue(),
  };

  const user = {
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: true,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
    save: vi.fn().mockResolvedValue(),
  };

  OtpChallenge.findOne.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      sort: vi.fn().mockResolvedValue(challenge),
    }),
  });

compareOtp.mockResolvedValue(true);

User.findOne.mockResolvedValue(user);

const response = await request(app)
    .post("/api/auth/verify-password-reset")
    .send({
      phone: "919876543210",
      otp: "123456",
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe(
    "OTP verified successfully"
  );

  expect(response.body.data.resetToken).toBe("test-reset-token");

  expect(user.passwordResetTokenHash).toBe("hashed-reset-token");
  expect(user.passwordResetExpiresAt).toBeInstanceOf(Date);
  expect(user.save).toHaveBeenCalled();

  expect(challenge.consumedAt).toBeInstanceOf(Date);
  expect(challenge.save).toHaveBeenCalled();
});

it("should reset password with valid reset token", async () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: true,
    passwordResetTokenHash: "hashed-reset-token",
    passwordResetExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    passwordHash: "old-password-hash",
    save: vi.fn().mockResolvedValue(),
  };

  User.findOne.mockReturnValueOnce({
    select: vi.fn().mockResolvedValue(user),
  });

  const response = await request(app)
    .post("/api/auth/reset-password")
    .send({
      phone: "919876543210",
      resetToken: "test-reset-token",
      newPassword: "NewPassword123",
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe(
    "Password reset successfully"
  );

  expect(user.passwordHash).toBe("hashed-password");
  expect(user.passwordResetTokenHash).toBeNull();
  expect(user.passwordResetExpiresAt).toBeNull();
  expect(user.save).toHaveBeenCalled();
});

it("should send login OTP for a verified user", async () => {
  User.findOne.mockResolvedValueOnce({
    _id: "507f1f77bcf86cd799439011",
    phone: "919876543210",
    phoneVerified: true,
  });

  OtpChallenge.findOne.mockReturnValueOnce({
    sort: vi.fn().mockResolvedValue(null),
  });

  OtpChallenge.updateMany.mockResolvedValueOnce({});
  OtpChallenge.create.mockResolvedValueOnce({
    _id: "507f1f77bcf86cd799439016",
  });

  const response = await request(app)
    .post("/api/auth/request-login-otp")
    .send({
      phone: "919876543210",
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);

  expect(sendWhatsAppOtp).toHaveBeenCalled();
  expect(OtpChallenge.create).toHaveBeenCalled();
});

});