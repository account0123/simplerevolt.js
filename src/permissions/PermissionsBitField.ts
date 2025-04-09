import Long from "long";

import { Permission } from "../index.js";
import { BitField } from "../utils/BitField.js";

export class PermissionsBitField extends BitField<keyof typeof Permission> {
  constructor(bits: number | Long = 0) {
    super(typeof bits == "number" ? Long.fromNumber(bits) : bits);
  }

  bitwiseAndEq(...b: number[]) {
    const value = b.reduce((prev, cur) => prev.or(cur), Long.fromNumber(0));
    return value.and(this.bitfield).eq(value);
  }
}
