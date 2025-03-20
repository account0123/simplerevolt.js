import Long from "long";
import { RecursiveReadonlyArray } from "..";

export type BitFieldResolvable<Flags extends string, Type extends number | bigint | Long> =
  | RecursiveReadonlyArray<Flags | Type | `${bigint}` | Readonly<BitField<Flags>>>
  | Flags
  | Type
  | `${bigint}`
  | Readonly<BitField<Flags>>;

export class BitField<Flags extends string> {
  static Flags = {};
  static defaultBit = Long.fromNumber(0);
  bitfield: Long;
  constructor(bits = BitField.defaultBit) {
    this.bitfield = bits;
  }

  /**
   * Checks whether the bitfield has a bit, or any of multiple bits.
   */
  any(bit: BitFieldResolvable<Flags, Long>) {
    return this.bitfield.and(BitField.resolve(bit)) != BitField.defaultBit;
  }

  /**
   * Resolves bitfields to their numeric form.
   */
  static resolve(bit: BitFieldResolvable<string, number | bigint | Long>): Long {
    const { defaultBit } = this;
    if (typeof bit == "string") {
      return typeof defaultBit == "bigint" ? Long.fromBigInt(BigInt(bit)) : Long.fromNumber(Number(bit));
    }
    if (typeof bit == "number") {
      return Long.fromNumber(bit);
    }
    if (typeof bit == "bigint") {
      return Long.fromBigInt(bit);
    }
    if (Array.isArray(bit)) {
      return bit.map((bit_) => this.resolve(bit_)).reduce((prev, bit_) => prev.or(bit_), defaultBit);
    }
    if (bit instanceof BitField) return bit.bitfield;
    if (bit instanceof Long) return bit;
    return defaultBit;
  }
}
