"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RJSError = void 0;
const ErrorCodes_1 = require("./ErrorCodes");
class RJSError extends Error {
    code;
    constructor(code, ...args) {
        super(format(code, ...args));
        this.code = code;
    }
    get name() {
        return `${super.name} [${this.code}]`;
    }
}
exports.RJSError = RJSError;
/**
 * Format the message for an error.
 */
function format(code, ...args) {
    if (!(code in ErrorCodes_1.ErrorCodes))
        throw new Error('Error code must be a valid DiscordjsErrorCodes');
    const msg = ErrorCodes_1.Messages[code];
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