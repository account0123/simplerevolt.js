export enum ErrorCodes {
  AccountDisabled = "AccountDisabled",
  NotFoundById = "NoSuchElement",
  MFANotImplemented = "MFANotImplemented",
  UnreachableCode = "UnreachableCode",
  UserDMNotFound = "UserDMNotFound",
  UserNoDiscriminator = "UserNoDiscriminator",
}

export const Messages: Record<ErrorCodes, string | ((...args: string[]) => string)> = {
  [ErrorCodes.AccountDisabled]: (id) => `Account ${id} is disabled.`,
  [ErrorCodes.MFANotImplemented]: "MFA is not implemented.",
  [ErrorCodes.NotFoundById]: (type, id) => `No ${type} found by ID ${id}.`,
  [ErrorCodes.UnreachableCode]: "Unreachable code.",
  [ErrorCodes.UserDMNotFound]: "User DM channel not found.",
  [ErrorCodes.UserNoDiscriminator]: "String must contain username#discriminator combo.",
};
