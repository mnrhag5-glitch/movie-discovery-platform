import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, passwordHash) => {
  return bcrypt.compare(password, passwordHash);
};

export const comparePasswordWithDummy = async (password) => {
  const dummyHash = process.env.DUMMY_PASSWORD_HASH;

  if (!dummyHash) {
    throw new Error("DUMMY_PASSWORD_HASH is missing");
  }

  return bcrypt.compare(password, dummyHash);
};