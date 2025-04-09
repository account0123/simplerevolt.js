export enum ErrorCodes {
  UnreachableCode = "UnreachableCode",
  UserDMNotFound = "UserDMNotFound",
}

export const Messages: Record<ErrorCodes, string | ((...args: string[]) => string)> = {
  [ErrorCodes.UnreachableCode]: "Unreachable code.",
  [ErrorCodes.UserDMNotFound]: "User DM channel not found.",
};
