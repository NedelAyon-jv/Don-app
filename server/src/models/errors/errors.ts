export const serviceErrorMap: {
  [key: string]: { code: string; status: number };
} = {
  USER_ALREADY_EXISTS: { code: "USER_ALREADY_EXISTS", status: 409 },
  INVALID_CREDENTIALS: { code: "INVALID_CREDENTIALS", status: 401 },
  USER_NOT_FOUND: { code: "USER_NOT_FOUND", status: 404 },
  EMAIL_ALREADY_EXISTS: { code: "EMAIL_ALREADY_EXISTS", status: 409 },
  USERNAME_ALREADY_EXISTS: { code: "USERNAME_ALREADY_EXISTS", status: 409 },
  ACCOUNT_DEACTIVATED: { code: "ACCOUNT_DEACTIVATED", status: 403 },
  INVALID_CURRENT_PASSWORD: { code: "INVALID_CURRENT_PASSWORD", status: 400 },
};
