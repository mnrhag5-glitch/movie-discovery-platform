import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return process.env.JWT_SECRET;
};

export const generateAccessToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    getJwtSecret(),
    {
      expiresIn: "15m",
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};