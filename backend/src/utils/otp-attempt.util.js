import OtpChallenge from "../models/otpChallenge.model.js";

export const incrementOtpAttempts = async (challengeId) => {
  const updatedChallenge = await OtpChallenge.findOneAndUpdate(
    {
      _id: challengeId,
      $expr: {
        $lt: ["$attempts", "$maxAttempts"],
      },
    },
    {
      $inc: {
        attempts: 1,
      },
    },
    {
      new: true,
    }
  );

  return updatedChallenge;
};