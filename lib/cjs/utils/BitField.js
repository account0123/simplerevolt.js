"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitField = void 0;
const long_1 = require("long");
class BitField {
    static Flags = {};
    static defaultBit = long_1.default.fromNumber(0);
    bitfield;
    constructor(bits = BitField.defaultBit) {
        this.bitfield = bits;
    }
    /**
     * Checks whether the bitfield has a bit, or any of multiple bits.
     */
    any(bit) {
        return this.bitfield.and(BitField.resolve(bit)) != BitField.defaultBit;
    }
    /**
    * Resolves bitfields to their numeric form.
    */
    static resolve(bit) {
        const { defaultBit } = this;
        if (typeof bit == "string") {
            return typeof defaultBit == "bigint" ? long_1.default.fromBigInt(BigInt(bit)) : long_1.default.fromNumber(Number(bit));
        }
        if (typeof bit == "number") {
            return long_1.default.fromNumber(bit);
        }
        if (typeof bit == "bigint") {
            return long_1.default.fromBigInt(bit);
        }
        if (Array.isArray(bit)) {
            return bit.map(bit_ => this.resolve(bit_)).reduce((prev, bit_) => prev.or(bit_), defaultBit);
        }
        if (bit instanceof BitField)
            return bit.bitfield;
        if (bit instanceof long_1.default)
            return bit;
        return defaultBit;
    }
}
exports.BitField = BitField;
//# sourceMappingURL=BitField.js.map