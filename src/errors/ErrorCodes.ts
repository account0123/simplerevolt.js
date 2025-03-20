export enum ErrorCodes {
    UnreachableCode = "UnreachableCode",
}

export const Messages: Record<ErrorCodes, string |((...args: string[])=>string)> = {
    [ErrorCodes.UnreachableCode]: "Unreachable code.",
};