export enum ErrorCodes {
  UnreachableCode = "UnreachableCode",
  UserDMNotFound = "UserDMNotFound",
  UserNoDiscriminator = "UserNoDiscriminator",
}

export const Messages: Record<ErrorCodes, string | ((...args: string[]) => string)> = {
  [ErrorCodes.UnreachableCode]: "Unreachable code.",
  [ErrorCodes.UserDMNotFound]: "User DM channel not found.",
  [ErrorCodes.UserNoDiscriminator]: "String must contain username#discriminator combo.",
};
