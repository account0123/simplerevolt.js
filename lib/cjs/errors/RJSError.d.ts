import { ErrorCodes } from "./ErrorCodes";
export declare class RJSError extends Error {
    readonly code: ErrorCodes;
    constructor(code: ErrorCodes, ...args: string[]);
    get name(): string;
}
//# sourceMappingURL=RJSError.d.ts.map