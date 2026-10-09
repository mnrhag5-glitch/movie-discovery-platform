export const createAppError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};