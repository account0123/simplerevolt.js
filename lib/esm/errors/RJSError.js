import { ErrorCodes, Messages } from "./ErrorCodes";
export class RJSError extends Error {
    code;
    constructor(code, ...args) {
        super(format(code, ...args));
        this.code = code;
    }
    get name() {
        return `${super.name} [${this.code}]`;
    }
}
/**
 * Format the message for an error.
 */
function format(code, ...args) {
    if (!(code in ErrorCodes))
        throw new Error('Error code must be a valid DiscordjsErrorCodes');
    const msg = Messages[code];
    if (!msg)
        throw new Error(`No message associated with error code: ${code}.`);
    if (typeof msg == 'function')
        return msg(...args);
    if (!args.length)
        return msg;
    args.unshift(msg);
    return String(...args);
}
//# sourceMappingURL=RJSError.js.map